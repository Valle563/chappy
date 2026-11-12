import { useState } from 'react'
import { useStore } from '../../data/store'
import { ZUsernames, ZMessages, type Message } from '../../../../packages/shared/src/schema'

const DirectMessages = () => {
	const token = useStore(store => store.token)
	const username = useStore(store => store.username)

	const [users, setUsers] = useState<string[]>([])
	const [selectedUser, setSelectedUser] = useState<string | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [text, setText] = useState('')
	const [error, setError] = useState('')

	const authHeaders: Record<string, string> = { Authorization: `Bearer ${token}` }

	const loadUsers = async () => {
		try {
			const response = await fetch('/api/users', { headers: authHeaders })
			if (!response.ok) {
				setError('Kunde inte hämta användare')
				return
			}
			const parsed = ZUsernames.safeParse(await response.json())
			if (!parsed.success) {
				setError('Oväntat svar från servern')
				return
			}
			setError('')
			setUsers(parsed.data)
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	const loadMessages = async (user: string) => {
		try {
			const response = await fetch(`/api/dm/${user}`, { headers: authHeaders })
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
			setSelectedUser(user)
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	const sendMessage = async () => {
		if (!selectedUser) return
		try {
			const response = await fetch(`/api/dm/${selectedUser}`, {
				method: 'POST',
				headers: { 'Content-type': 'application/json', ...authHeaders },
				body: JSON.stringify({ text }),
			})
			if (!response.ok) {
				setError('Kunde inte skicka meddelandet')
				return
			}
			setText('')
			loadMessages(selectedUser)
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	if (!username) {
		return <p>Logga in för att skicka direktmeddelanden</p>
	}

	return (
		<div>
			<h2>Direktmeddelanden</h2>
			<p>{error}</p>
			<button onClick={loadUsers}>Hämta användare</button>
			<ul>
				{users.map(user => (
					<li key={user}>
						<button onClick={() => loadMessages(user)}>{user}</button>
					</li>
				))}
			</ul>

			{selectedUser && (
				<div>
					<h3>Chatt med {selectedUser}</h3>
					<ul>
						{messages.map(msg => (
							<li key={msg.sk}>{msg.sender}: {msg.text}</li>
						))}
					</ul>
					<input
						value={text}
						onChange={e => setText(e.target.value)}
						placeholder="Skriv ett meddelande"
					/>
					<button onClick={sendMessage}>Skicka</button>
				</div>
			)}
		</div>
	)
}

export default DirectMessages