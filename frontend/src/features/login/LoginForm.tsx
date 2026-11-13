import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '../../data/store'
import { ZLoginResponse } from '../../../../packages/shared/src/schema'
import './LoginForm.css'

const LoginForm = () => {
	const [usernameInput, setUsernameInput] = useState('')
	const [passwordInput, setPasswordInput] = useState('')
	const [message, setMessage] = useState('')
	const setAuth = useStore(store => store.setAuth)
	const navigate = useNavigate()

	const body = JSON.stringify({ username: usernameInput, password: passwordInput })

	const login = async () => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body,
			})
			if (!response.ok) {
				setMessage('Fel användarnamn eller lösenord')
				return
			}
			const parsed = ZLoginResponse.safeParse(await response.json())
			if (!parsed.success) {
				setMessage('Oväntat svar från servern')
				return
			}
			setAuth(parsed.data.token, usernameInput)
			navigate('/')
		} catch (error) {
			console.error(error)
			setMessage('Något gick fel, försök igen')
		}
	}

	const register = async () => {
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body,
			})
			if (response.status === 409) {
				setMessage('Användarnamnet är upptaget')
				return
			}
			if (!response.ok) {
				setMessage('Användarnamn minst 3 tecken och lösenord minst 8 tecken')
				return
			}
			await login()
		} catch (error) {
			console.error(error)
			setMessage('Något gick fel, försök igen')
		}
	}

	return (
		<div className="login-card">
			<h2>Logga in</h2>
			<label>
				Användarnamn
				<input
					placeholder="Ditt namn"
					value={usernameInput}
					onChange={e => setUsernameInput(e.target.value)}
				/>
			</label>
			<label>
				Lösenord
				<input
					type="password"
					placeholder="Ditt lösenord"
					value={passwordInput}
					onChange={e => setPasswordInput(e.target.value)}
				/>
			</label>
			<p className="login-message">{message}</p>
			<button className="primary" onClick={login}>Logga in</button>
			<button className="secondary" onClick={register}>Registrera dig</button>
		</div>
	)
}

export default LoginForm