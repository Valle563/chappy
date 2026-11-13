import { Outlet } from 'react-router'
import Sidebar from '../features/sidebar/Sidebar'
import './Root.css'

const Root = () => (
	<div className="root-layout">
		<Sidebar />
		<main className="root-main">
			<Outlet />
		</main>
	</div>
)

export default Root