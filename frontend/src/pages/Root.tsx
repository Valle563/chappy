import { NavLink, Outlet } from 'react-router'
import Login from '../features/login/Login.tsx'

const Root = () => (
	<div>
		<header>
			<h1>Chappy</h1>
			<Login />
			<nav>
				<NavLink to="/"> Kanaler </NavLink>
				<NavLink to="/dm"> Direktmeddelanden </NavLink>
			</nav>
		</header>
		<main>
			<Outlet />
		</main>
	</div>
)

export default Root