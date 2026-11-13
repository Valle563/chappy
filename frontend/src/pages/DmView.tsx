import { useParams } from 'react-router'
import DmChat from '../features/dm/DmChat'

const DmView = () => {
	const { username } = useParams()
	if (!username) return null
	return <DmChat key={username} otherUser={username} />
}

export default DmView