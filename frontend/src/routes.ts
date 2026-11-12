import type { RouteObject } from 'react-router'
import Root from './pages/Root.tsx'
import ChannelsView from './pages/ChannelsView.tsx'
import DmView from './pages/DmView.tsx'

const routerConfig: RouteObject[] = [
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