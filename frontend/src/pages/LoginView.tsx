import { useNavigate } from 'react-router'
import LoginForm from '../features/login/LoginForm'
import './LoginView.css'

const LoginView = () => {
	const navigate = useNavigate()

	return (
		<div className="login-view">
			<section className="login-hero">
				<div className="logo">
					<span className="logo-icon">💬</span> Chappy
				</div>
				<h1>Prata med alla, eller bara med några.</h1>
				<p>Öppna kanaler för alla, låsta kanaler och DM när du har loggat in.</p>
				<ul>
					<li>✓ Läs och skriv i öppna kanaler som gäst</li>
					<li>✓ Logga in för låsta kanaler och DM</li>
					<li>✓ AI sammanfattar långa konversationer åt dig</li>
				</ul>
			</section>
			<section className="login-panel">
				<LoginForm />
				<button className="guest" onClick={() => navigate('/')}>Fortsätt som gäst</button>
				<p>Gäster kan läsa och skriva i öppna kanaler</p>
			</section>
		</div>
	)
}

export default LoginView