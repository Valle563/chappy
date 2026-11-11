import express, { type Router } from 'express'
import { ScanCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { db, TABLE_NAME } from '../db.ts'
import { ZChannel, ZMessage, ZNewMessage } from '../../../packages/shared/src/schema.ts'

const router: Router = express.Router()

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

router.post('/:channelId/messages', async (req, res) => {
	const parsed = ZNewMessage.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const item = {
		pk: `CHANNEL#${req.params.channelId}`,
		sk: `MSG#${new Date().toISOString()}`,
		sender: parsed.data.sender,
		text: parsed.data.text,
	}

	try {
		await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
		res.status(201).json(item)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router