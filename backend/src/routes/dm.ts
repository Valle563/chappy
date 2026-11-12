import express, { type Router } from 'express'
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { db, TABLE_NAME } from '../db.ts'
import { ZMessage, ZNewMessage } from '../../../packages/shared/src/schema.ts'

const router: Router = express.Router()

function dmKey(a: string, b: string): string {
	return `DM#${[a, b].sort().join('#')}`
}

router.get('/:otherUser', async (req, res) => {
	const username = res.locals.username
	if (typeof username !== 'string') {
		res.sendStatus(401)
		return
	}

	try {
		const result = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
				ExpressionAttributeValues: {
					':pk': dmKey(username, req.params.otherUser),
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

router.post('/:otherUser', async (req, res) => {
	const username = res.locals.username
	if (typeof username !== 'string') {
		res.sendStatus(401)
		return
	}

	const parsed = ZNewMessage.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	try {
		const other = await db.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { pk: `USER#${req.params.otherUser}`, sk: 'PROFILE' },
			}),
		)
		if (!other.Item) {
			res.sendStatus(404)
			return
		}

		const item = {
			pk: dmKey(username, req.params.otherUser),
			sk: `MSG#${new Date().toISOString()}`,
			sender: username,
			text: parsed.data.text,
		}
		await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
		res.status(201).json(item)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router