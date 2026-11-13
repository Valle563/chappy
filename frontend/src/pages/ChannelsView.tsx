import { useParams } from 'react-router'
import ChannelChat from '../features/channels/ChannelChat'

const ChannelView = () => {
	const { channelId } = useParams()
	if (!channelId) return null
	return <ChannelChat key={channelId} channelId={channelId} />
}

export default ChannelView