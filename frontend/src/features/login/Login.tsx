// import { useState } from 'react'
// import { useStore } from '../../data/store'
// import { ZLoginResponse } from '../../../../packages/shared/src/schema'

// const Login = () => {
// 	const [usernameInput, setUsernameInput] = useState('')
// 	const [passwordInput, setPasswordInput] = useState('')
// 	const [loginMessage, setLoginMessage] = useState('')

// 	const username = useStore(store => store.username)
// 	const setAuth = useStore(store => store.setAuth)
// 	const logout = useStore(store => store.logout)
//   const token = useStore(store => store.token)

// 	const handleLogin = async () => {
// 		try {
// 			const response = await fetch('/api/auth/login', {
// 				method: 'POST',
// 				headers: { 'Content-type': 'application/json' },
// 				body: JSON.stringify({ username: usernameInput, password: passwordInput }),
// 			})

// 			if (!response.ok) {
// 				setLoginMessage('Fel användarnamn eller lösenord')
// 				return
// 			}

//       const data: unknown = await response.json()
//       const parsed = ZLoginResponse.safeParse(data)
//       if (!parsed.success) {
//         setLoginMessage('Oväntat svar från servern')
//         return
//       }

//       setAuth(parsed.data.token, usernameInput)
// 			setLoginMessage('')
// 			setPasswordInput('')
// 		} catch (error) {
// 			console.error(error)
// 			setLoginMessage('Något gick fel, försök igen')
// 		}
// 	}

//   const handleDeleteAccount = async () => {
// 	if (!window.confirm('Vill du verkligen ta bort ditt konto?')) return
// 	try {
// 		const response = await fetch('/api/users/me', {
// 			method: 'DELETE',
// 			headers: { Authorization: `Bearer ${token}` },
// 		})
// 		if (!response.ok) {
// 			setLoginMessage('Kunde inte ta bort kontot')
// 			return
// 		}
// 		logout()
// 	} catch (error) {
// 		console.error(error)
// 		setLoginMessage('Något gick fel, försök igen')
// 	}
// }

// if (username) {
// 	return (
// 		<div>
// 			<p>Inloggad som {username}</p>
// 			<button onClick={logout}>Logga ut</button>
// 			<button onClick={handleDeleteAccount}>Ta bort konto</button>
// 			<p>{loginMessage}</p>
// 		</div>
// 	)
// }

// 	return (
// 		<div>
// 			<input
// 				placeholder="Användarnamn"
// 				value={usernameInput}
// 				onChange={e => setUsernameInput(e.target.value)}
// 			/>
// 			<input
// 				type="password"
// 				placeholder="Lösenord"
// 				value={passwordInput}
// 				onChange={e => setPasswordInput(e.target.value)}
// 			/>
// 			<button onClick={handleLogin}>Logga in</button>
// 			<p>{loginMessage}</p>
// 		</div>
// 	)
// }

// export default Login

