import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useStore } from '../../data/store'
import { fetchChannels, fetchUsers } from '../../data/api'
import './Sidebar.css'

const Sidebar = () => {
	const token = useStore(store => store.token)
	const username = useStore(store => store.username)
	const channels = useStore(store => store.channels)
	const users = useStore(store => store.users)
	const setChannels = useStore(store => store.setChannels)
	const setUsers = useStore(store => store.setUsers)
	const logout = useStore(store => store.logout)
	const navigate = useNavigate()

	const [showForm, setShowForm] = useState(false)
	const [newName, setNewName] = useState('')
	const [newLocked, setNewLocked] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		fetchChannels().then(result => {
			if (result) setChannels(result)
		})
	}, [setChannels])

	useEffect(() => {
		if (!token) return
		fetchUsers(token).then(result => {
			if (result) setUsers(result)
		})
	}, [token, setUsers])

	const createChannel = async () => {
		try {
			const response = await fetch('/api/channels', {
				method: 'POST',
				headers: { 'Content-type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ name: newName.trim(), isLocked: newLocked }),
			})
			if (!response.ok) {
				setError(
					response.status === 409 ? 'Kanalen finns redan'
					: response.status === 400 ? 'Ogiltigt namn (bokstäver, siffror, mellanslag och bindestreck, max 30 tecken)'
					: 'Kunde inte skapa kanalen'
				)
				return
			}
			const result = await fetchChannels()
			if (result) setChannels(result)
			setNewName('')
			setNewLocked(false)
			setShowForm(false)
			setError('')
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	const deleteAccount = async () => {
		if (!window.confirm('Vill du verkligen ta bort ditt konto?')) return
		try {
			const response = await fetch('/api/users/me', {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!response.ok) {
				setError('Kunde inte ta bort kontot')
				return
			}
			logout()
			navigate('/')
		} catch (err) {
			console.error(err)
			setError('Något gick fel')
		}
	}

	return (
		<aside className="sidebar">
			<div className="sidebar-logo">
				<span className="logo-icon">💬</span> Chappy
			</div>

			<div className="sidebar-section">
				<div className="sidebar-heading">
					<span>KANALER</span>
					{username && (
						<button className="icon-button" onClick={() => setShowForm(!showForm)}>+</button>
					)}
				</div>
				{showForm && (
					<div className="channel-form">
						<input
							type="text"
							placeholder="Namn på ny kanal"
							value={newName}
							onChange={e => setNewName(e.target.value)}
						/>
						<label>
							<input
								type="checkbox"
								checked={newLocked}
								onChange={e => setNewLocked(e.target.checked)}
							/>
							Låst kanal
						</label>
						<button onClick={createChannel}>Skapa kanal</button>
					</div>
				)}
				{error && <p className="sidebar-error">{error}</p>}
				{channels.map(channel => {
					const id = channel.pk.replace('CHANNEL#', '')
					return (
						<NavLink key={channel.pk} to={`/channels/${encodeURIComponent(id)}`} className="sidebar-link">
							{channel.isLocked ? '🔒' : '#'} {id}
						</NavLink>
					)
				})}
			</div>

			{username && (
				<div className="sidebar-section">
					<div className="sidebar-heading">
						<span>DIREKTMEDDELANDEN</span>
					</div>
					{users.map(user => (
						<NavLink key={user} to={`/dm/${encodeURIComponent(user)}`} className="sidebar-link dm">
							{user}
						</NavLink>
					))}
				</div>
			)}

			<div className="sidebar-user">
				{username ? (
					<>
						<div className="sidebar-user-info">
							<div className="avatar">{username[0].toUpperCase()}</div>
							<div>
								{username}
								<small>Inloggad</small>
							</div>
						</div>
						<div className="sidebar-user-actions">
							<button onClick={logout}>Logga ut</button>
							<button className="danger" onClick={deleteAccount}>Ta bort konto</button>
						</div>
					</>
				) : (
					<>
						<div className="sidebar-user-info">
							<div className="avatar">G</div>
							<div>
								Gäst
								<small>Inte inloggad</small>
							</div>
						</div>
						<div className="sidebar-user-actions">
							<button onClick={() => navigate('/login')}>Logga in</button>
						</div>
					</>
				)}
			</div>
		</aside>
	)
}

export default Sidebar