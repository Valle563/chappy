import type { RouteObject } from 'react-router'
import Root from './pages/Root.tsx'
import LoginView from './pages/LoginView.tsx'
import WelcomeView from './pages/WelcomeView.tsx'

const routerConfig: RouteObject[] = [
	{ path: '/login', Component: LoginView },
	{
		path: '/',
		Component: Root,
		children: [
			{ index: true, Component: WelcomeView },
		],
	},
]

export { routerConfig }