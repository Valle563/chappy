import express, { type Router } from 'express'
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'
import { db, TABLE_NAME } from '../db.ts'
import { ZUser } from '../../../packages/shared/src/schema.ts'

const router: Router = express.Router()

router.get('/', async (req, res) => {
	const username = res.locals.username

	try {
		const result = await db.send(
			new ScanCommand({
				TableName: TABLE_NAME,
				FilterExpression: 'sk = :sk',
				ExpressionAttributeValues: { ':sk': 'PROFILE' },
			}),
		)

		const parsed = z.array(ZUser).safeParse(result.Items)
		if (!parsed.success) {
			console.error(parsed.error)
			res.sendStatus(500)
			return
		}

		const names = parsed.data
			.map(u => u.pk.replace('USER#', ''))
			.filter(name => name !== username)
		res.json(names)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.delete('/me', async (req, res) => {
	const username = res.locals.username
	if (typeof username !== 'string') {
		res.sendStatus(401)
		return
	}

	try {
		await db.send(
			new DeleteCommand({
				TableName: TABLE_NAME,
				Key: { pk: `USER#${username}`, sk: 'PROFILE' },
			}),
		)
		res.sendStatus(204)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router