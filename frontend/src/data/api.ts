import { ZChannels, ZUsernames, type Channel } from '../../../packages/shared/src/schema'

export async function fetchChannels(): Promise<Channel[] | null> {
	try {
		const response = await fetch('/api/channels')
		if (!response.ok) return null
		const parsed = ZChannels.safeParse(await response.json())
		return parsed.success ? parsed.data : null
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function fetchUsers(token: string): Promise<string[] | null> {
	try {
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
		const response = await fetch('/api/users', { headers })
		if (!response.ok) return null
		const parsed = ZUsernames.safeParse(await response.json())
		return parsed.success ? parsed.data : null
	} catch (error) {
		console.error(error)
		return null
	}
}