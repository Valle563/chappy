import type { RouteObject } from 'react-router'
import Root from './pages/Root.tsx'
import ChannelsView from './pages/ChannelsView.tsx'
import DmView from './pages/DmView.tsx'
import LoginView from './pages/LoginView.tsx'

const routerConfig: RouteObject[] = [
	{ path: '/login', Component: LoginView },
	{
		path: '/',
		Component: Root,
		children: [
			{ path: '/', Component: ChannelsView },
			{ path: '/dm', Component: DmView },
		],
	},
]

export { routerConfig }