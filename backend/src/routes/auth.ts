import express, { type Router } from 'express'
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db, TABLE_NAME } from '../db.ts'
import { ZCredentials, ZUser } from '../../../packages/shared/src/schema.ts'

const router: Router = express.Router()

router.post('/register', async (req, res) => {
	const parsed = ZCredentials.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const { username, password } = parsed.data
	const passwordHash = await bcrypt.hash(password, 10)

	try {
		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: { pk: `USER#${username}`, sk: 'PROFILE', passwordHash },
				ConditionExpression: 'attribute_not_exists(pk)',
			}),
		)
		res.sendStatus(201)
	} catch (error) {
		if (error instanceof ConditionalCheckFailedException) {
			res.sendStatus(409)
			return
		}
		console.error(error)
		res.sendStatus(500)
	}
})

router.post('/login', async (req, res) => {
	const parsed = ZCredentials.safeParse(req.body)
	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const { username, password } = parsed.data

	try {
		const result = await db.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { pk: `USER#${username}`, sk: 'PROFILE' },
			}),
		)

		const user = ZUser.safeParse(result.Item)
		if (!user.success) {
			res.sendStatus(401)
			return
		}

		const passwordOk = await bcrypt.compare(password, user.data.passwordHash)
		if (!passwordOk) {
			res.sendStatus(401)
			return
		}

		const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '1h' })
		res.json({ token })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router