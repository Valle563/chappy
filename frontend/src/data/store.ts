import { create } from 'zustand'
import type { Channel } from '../../../packages/shared/src/schema'

type Store = {
	token: string;
	username: string;
	channels: Channel[];
	users: string[];
	setAuth: (token: string, username: string) => void;
	logout: () => void;
	setChannels: (channels: Channel[]) => void;
	setUsers: (users: string[]) => void;
}

const useStore = create<Store>(set => ({
	token: '',
	username: '',
	channels: [],
	users: [],
	setAuth: (token, username) => { set({ token, username }) },
	logout: () => { set({ token: '', username: '', users: [] }) },
	setChannels: channels => { set({ channels }) },
	setUsers: users => { set({ users }) },
}))

export { useStore }