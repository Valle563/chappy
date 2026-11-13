
import { useState } from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../features/sidebar/Sidebar'
import './Root.css'

const Root = () => {
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div className="root-layout">
			<div className="mobile-bar">
				<button onClick={() => setMenuOpen(!menuOpen)}>
					☰
				</button>
				<span>Chappy</span>
			</div>

			<Sidebar
				open={menuOpen}
				onNavigate={() => setMenuOpen(false)}
			/>

			<main className="root-main">
				<Outlet />
			</main>
		</div>
	)
}

export default Root
