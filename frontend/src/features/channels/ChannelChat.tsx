import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '../../data/store'
import { fetchChannels } from '../../data/api'
import { ZMessage, ZMessages, ZSummaryResponse, type Message } from '../../../../packages/shared/src/schema'
import './ChannelChat.css'

type Props = { channelId: string }

const ChannelChat = ({ channelId }: Props) => {
	const token = useStore(store => store.token)
	const username = useStore(store => store.username)
	const channels = useStore(store => store.channels)
	const setChannels = useStore(store => store.setChannels)
	const navigate = useNavigate()

	const [messages, setMessages] = useState<Message[]>([])
	const [text, setText] = useState('')
	const [error, setError] = useState('')
	const [showSummary, setShowSummary] = useState(false)
	const [summary, setSummary] = useState('')

	const channel = channels.find(c => c.pk === `CHANNEL#${channelId}`)
	const url = `/api/channels/${encodeURIComponent(channelId)}`
	const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

	useEffect(() => {
		const load = async () => {
			const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
			try {
				const response = await fetch(`/api/channels/${encodeURIComponent(channelId)}/messages`, { headers })
				if (!response.ok) {
					setError(
						response.status === 401 ? 'Logga in för att se den här kanalen'
						: response.status === 404 ? 'Kanalen finns inte'
						: 'Något gick fel'
					)
					return
				}
				const parsed = ZMessages.safeParse(await response.json())
				if (!parsed.success) {
					setError('Oväntat svar från servern')
					return
				}
				setError('')
				setMessages(parsed.data)
			} catch (err) {
				console.error(err)
				setError('Något gick fel')
			}
		}
		load()
	}, [channelId, token])

	const sendMessage = async (e: FormEvent) => {
		e.preventDefault()
		if (!text.trim()) return
		try {
			const response = await fetch(`${url}/messages`, {
				method: 'POST',
				headers: { 'Content-type': 'application/json', ...authHeaders },
				body: JSON.stringify({ text }),
			})
			if (!response.ok) {
				setError('Kunde inte skicka meddelandet')
				return
			}
			const parsed = ZMessage.safeParse(await response.json())
			if (!parsed.success) {
				setError('Oväntat svar från servern')
				return
			}
			setError('')
			setText('')
			setMessages([...messages, parsed.data])
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	const summarize = async () => {
		setSummary('Sammanfattar...')
		try {
			const response = await fetch(`${url}/summary`, {
				method: 'POST',
				headers: authHeaders,
			})
			if (!response.ok) {
				setSummary('Kunde inte sammanfatta kanalen')
				return
			}
			const parsed = ZSummaryResponse.safeParse(await response.json())
			if (!parsed.success) {
				setSummary('Oväntat svar från servern')
				return
			}
			setSummary(parsed.data.summary)
		} catch (err) {
			console.error(err)
			setSummary('Något gick fel')
		}
	}

	const deleteChannel = async () => {
		if (!window.confirm(`Vill du ta bort kanalen ${channelId}?`)) return
		try {
			const response = await fetch(url, { method: 'DELETE', headers: authHeaders })
			if (!response.ok) {
				setError('Kunde inte ta bort kanalen')
				return
			}
			const result = await fetchChannels()
			if (result) setChannels(result)
			navigate('/')
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	return (
		<div className="chat">
			<section className="chat-main">
				<header className="chat-header">
					<div>
						<h2>{channel?.isLocked ? '🔒' : '#'} {channelId}</h2>
						<p>
							{channel?.isLocked
								? 'Låst kanal - bara inloggade användare'
								: 'Öppen kanal - alla kan läsa och skriva'}
						</p>
					</div>
					<div className="chat-header-actions">
						<button onClick={() => setShowSummary(!showSummary)}>AI-sammanfattning</button>
						{channel && channel.createdBy === username && (
							<button className="danger" onClick={deleteChannel}>Ta bort kanal</button>
						)}
					</div>
				</header>

				<div className="chat-messages">
					{error && <p className="chat-error">{error}</p>}
					{messages.map(msg => (
						<div key={msg.sk} className="chat-message">
							<div className="avatar">{msg.sender.charAt(0).toUpperCase()}</div>
							<div>
								<div className="chat-message-meta">
									<strong>{msg.sender}</strong>
									<span>
										{new Date(msg.sk.replace('MSG#', '')).toLocaleTimeString('sv-SE', {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>
								<p>{msg.text}</p>
							</div>
						</div>
					))}
				</div>

				<form className="chat-input" onSubmit={sendMessage}>
					<input
						placeholder={`Skriv ett meddelande i ${channelId}`}
						value={text}
						onChange={e => setText(e.target.value)}
					/>
					<button type="submit" className="primary">Skicka</button>
				</form>
			</section>

			{showSummary && (
				<aside className="summary-panel">
					<div className="summary-header">
					<h3>AI-sammanfattning</h3>
					<button className="icon-button" onClick={() => setShowSummary(false)}>✕</button>
				</div>
					<p>{summary || 'Tryck på knappen för att sammanfatta kanalen.'}</p>
					<button className="primary" onClick={summarize}>Uppdatera sammanfattning</button>
				</aside>
			)}
		</div>
	)
}

export default ChannelChat