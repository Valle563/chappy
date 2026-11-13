import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '../../data/store'
import { ZMessage, ZMessages, type Message } from '../../../../packages/shared/src/schema'
import '../channels/ChannelChat.css'
import './DmChat.css'

type Props = { otherUser: string }

const DmChat = ({ otherUser }: Props) => {
	const token = useStore(store => store.token)
	const username = useStore(store => store.username)

	const [messages, setMessages] = useState<Message[]>([])
	const [text, setText] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (!token) return
		const load = async () => {
			try {
				const response = await fetch(`/api/dm/${encodeURIComponent(otherUser)}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (!response.ok) {
					setError('Kunde inte hämta meddelanden')
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
	}, [otherUser, token])

	const sendMessage = async (e: FormEvent) => {
		e.preventDefault()
		if (!text.trim()) return
		try {
			const response = await fetch(`/api/dm/${encodeURIComponent(otherUser)}`, {
				method: 'POST',
				headers: { 'Content-type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ text }),
			})
			if (!response.ok) {
				setError(response.status === 404 ? 'Användaren finns inte' : 'Kunde inte skicka meddelandet')
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

	if (!token) {
		return (
			<div className="welcome-view">
				<p>Logga in för att skicka direktmeddelanden</p>
			</div>
		)
	}

	return (
		<div className="chat">
			<section className="chat-main">
				<header className="chat-header">
					<div className="dm-header">
						<div className="avatar">{otherUser.charAt(0).toUpperCase()}</div>
						<div>
							<h2>{otherUser}</h2>
							<p>Bara du och {otherUser} kan se den här konversationen</p>
						</div>
					</div>
				</header>

				<div className="chat-messages">
					{error && <p className="chat-error">{error}</p>}
					{messages.map(msg => (
						<div
							key={msg.sk}
							className={msg.sender === username ? 'dm-message mine' : 'dm-message theirs'}
						>
							<div className="dm-bubble">{msg.text}</div>
							<div className="dm-meta">
								{msg.sender === username ? 'Du' : msg.sender}{' '}
								{new Date(msg.sk.replace('MSG#', '')).toLocaleTimeString('sv-SE', {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</div>
						</div>
					))}
				</div>

				<form className="chat-input" onSubmit={sendMessage}>
					<input
						placeholder={`Skriv ett meddelande till ${otherUser}`}
						value={text}
						onChange={e => setText(e.target.value)}
					/>
					<button type="submit" className="primary">Skicka</button>
				</form>
			</section>
		</div>
	)
}

export default DmChat