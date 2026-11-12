import express from 'express'
import { type Express } from 'express'
import path from 'node:path'
import { logger, authenticate } from './middleware.ts'
import channelRouter from './routes/channels.ts'
import authRouter from './routes/auth.ts'
import dmRouter from './routes/dm.ts'

const app: Express = express()
const port: number = Number(process.env.PORT) || 3011
const distPath: string = path.resolve(import.meta.dirname, '../../../../frontend/dist')

app.use(express.json())
app.use(express.static(distPath))
app.use('/', logger)
app.use(authenticate)

app.use('/api/channels', channelRouter)
app.use('/api/auth', authRouter)
app.use('/api/dm', dmRouter)

app.listen(port, () => {
	console.log(`Servern lyssnar på port ${port}`)
})