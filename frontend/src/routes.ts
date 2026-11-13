import type { RouteObject } from 'react-router'
import Root from './pages/Root.tsx'
import LoginView from './pages/LoginView.tsx'
import WelcomeView from './pages/WelcomeView.tsx'
import ChannelView from './pages/ChannelsView.tsx'
import DmView from './pages/DmView.tsx'

const routerConfig: RouteObject[] = [
	{ path: '/login', Component: LoginView },
	{
		path: '/',
		Component: Root,
		children: [
	{ index: true, Component: WelcomeView },
	{ path: 'channels/:channelId', Component: ChannelView },
	{ path: 'dm/:username', Component: DmView },
],
	},
]

export { routerConfig }