import { useState } from 'react'
import { useStore } from '../../data/store'

const Login = () => {
	const [usernameInput, setUsernameInput] = useState('')
	const [passwordInput, setPasswordInput] = useState('')
	const [loginMessage, setLoginMessage] = useState('')

	const username = useStore(store => store.username)
	const setAuth = useStore(store => store.setAuth)
	const logout = useStore(store => store.logout)

	const handleLogin = async () => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ username: usernameInput, password: passwordInput }),
			})

			if (!response.ok) {
				setLoginMessage('Fel användarnamn eller lösenord')
				return
			}

			const data = await response.json()
			setAuth(data.token, usernameInput)
			setLoginMessage('')
			setPasswordInput('')
		} catch (error) {
			console.error(error)
			setLoginMessage('Något gick fel, försök igen')
		}
	}

	if (username) {
		return (
			<div>
				<p>Inloggad som {username}</p>
				<button onClick={logout}>Logga ut</button>
			</div>
		)
	}

	return (
		<div>
			<input
				placeholder="Användarnamn"
				value={usernameInput}
				onChange={e => setUsernameInput(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Lösenord"
				value={passwordInput}
				onChange={e => setPasswordInput(e.target.value)}
			/>
			<button onClick={handleLogin}>Logga in</button>
			<p>{loginMessage}</p>
		</div>
	)
}

export default Login