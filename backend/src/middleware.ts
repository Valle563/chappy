import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

export function formatTimestamp(date: Date = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0')
	const yyyy = date.getFullYear()
	const mm = pad(date.getMonth() + 1)
	const dd = pad(date.getDate())
	const hh = pad(date.getHours())
	const min = pad(date.getMinutes())
	const ss = pad(date.getSeconds())
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

export const logger: RequestHandler = (req, res, next) => {
	const now = formatTimestamp()
	console.log(`${now}  ${req.method}  ${req.url}`)
	next()
}

export const authenticate: RequestHandler = (req, res, next) => {
	const header = req.headers.authorization
	if (header && header.startsWith('Bearer ')) {
		const token = header.slice(7)
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET!)
			if (typeof payload !== 'string') {
				res.locals.username = payload.username
			}
		} catch (error) {
			// ogiltig eller utgången token: behandla anropet som en gäst
		}
	}
	next()
}