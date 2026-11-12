import express, { type Router } from 'express'
import { ScanCommand, QueryCommand, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { db, TABLE_NAME } from '../db.ts'
import { ZChannel, ZMessage, ZNewMessage, ZNewChannel } from '../../../packages/shared/src/schema.ts'
import { summarize } from '../ai.ts'

const router: Router = express.Router()

async function checkAccess(
	channelId: string,
	username: unknown,
): Promise<'ok' | 'missing' | 'locked'> {
	const result = await db.send(
		new GetCommand({
			TableName: TABLE_NAME,
			Key: { pk: `CHANNEL#${channelId}`, sk: 'meta' },
		}),
	)

	const parsed = ZChannel.safeParse(result.Item)
	if (!parsed.success) {
		return 'missing'
	}
	if (parsed.data.isLocked && typeof username !== 'string') {
		return 'locked'
	}
	return 'ok'
}

router.get('/', async (req, res) => {
	try {
		const result = await db.send(
			new ScanCommand({
				TableName: TABLE_NAME,
				FilterExpression: 'sk = :sk',
				ExpressionAttributeValues: { ':sk': 'meta' },
			}),
		)

		const parsed = z.array(ZChannel).safeParse(result.Items)
		if (!parsed.success) {
			console.error(parsed.error)
			res.sendStatus(500)
			return
		}
		res.json(parsed.data)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get('/:channelId/messages', async (req, res) => {
	try {
		const access = await checkAccess(req.params.channelId, res.locals.username)
		if (access === 'missing') {
			res.sendStatus(404)
			return
		}
		if (access === 'locked') {
			res.sendStatus(401)
			return
		}

		const result = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
				ExpressionAttributeValues: {
					':pk': `CHANNEL#${req.params.channelId}`,
					':prefix': 'MSG#',
				},
			}),
		)

		const parsed = z.array(ZMessage).safeParse(result.Items)
		if (!parsed.success) {
			console.error(parsed.error)
			res.sendStatus(500)
			return
		}
		res.json(parsed.data)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.post('/', async (req, res) => {
	const username = res.locals.username
	if (typeof username !== 'string') {
		res.sendStatus(401)
		return
	}

	const parsed = ZNewChannel.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const item = {
		pk: `CHANNEL#${parsed.data.name}`,
		sk: 'meta',
		createdBy: username,
		isLocked: parsed.data.isLocked,
	}

	try {
		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: item,
				ConditionExpression: 'attribute_not_exists(pk)',
			}),
		)
		res.status(201).json(item)
	} catch (error) {
		if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
			res.sendStatus(409)
			return
		}
		console.error(error)
		res.sendStatus(500)
	}
})


router.post('/:channelId/messages', async (req, res) => {
	const parsed = ZNewMessage.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const sender = typeof res.locals.username === 'string' ? res.locals.username : 'Gäst'

	const item = {
		pk: `CHANNEL#${req.params.channelId}`,
		sk: `MSG#${new Date().toISOString()}`,
		sender,
		text: parsed.data.text,
	}

	try {
		const access = await checkAccess(req.params.channelId, res.locals.username)
		if (access === 'missing') {
			res.sendStatus(404)
			return
		}
		if (access === 'locked') {
			res.sendStatus(401)
			return
		}

		await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
		res.status(201).json(item)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.post('/:channelId/summary', async (req, res) => {
	try {
		const access = await checkAccess(req.params.channelId, res.locals.username)
		if (access === 'missing') {
			res.sendStatus(404)
			return
		}
		if (access === 'locked') {
			res.sendStatus(401)
			return
		}

		const result = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
				ExpressionAttributeValues: {
					':pk': `CHANNEL#${req.params.channelId}`,
					':prefix': 'MSG#',
				},
			}),
		)

		const parsed = z.array(ZMessage).safeParse(result.Items)
		if (!parsed.success) {
			console.error(parsed.error)
			res.sendStatus(500)
			return
		}

		if (parsed.data.length === 0) {
			res.json({ summary: 'Det finns inga meddelanden att sammanfatta.' })
			return
		}

		const conversation = parsed.data
			.slice(-50)
			.map(m => `${m.sender}: ${m.text}`)
			.join('\n')

		const summary = await summarize(conversation)
		if (summary === null) {
			res.sendStatus(500)
			return
		}
		res.json({ summary })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.delete('/:channelId', async (req, res) => {
	const username = res.locals.username
	if (typeof username !== 'string') {
		res.sendStatus(401)
		return
	}

	try {
		const channel = await db.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { pk: `CHANNEL#${req.params.channelId}`, sk: 'meta' },
			}),
		)
		const parsed = ZChannel.safeParse(channel.Item)
		if (!parsed.success) {
			res.sendStatus(404)
			return
		}
		if (parsed.data.createdBy !== username) {
			res.sendStatus(403)
			return
		}

		const items = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: 'pk = :pk',
				ExpressionAttributeValues: { ':pk': `CHANNEL#${req.params.channelId}` },
			}),
		)
		for (const item of items.Items ?? []) {
			await db.send(
				new DeleteCommand({
					TableName: TABLE_NAME,
					Key: { pk: item.pk, sk: item.sk },
				}),
			)
		}
		res.sendStatus(204)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})


export default router