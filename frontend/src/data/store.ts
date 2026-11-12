import { create } from 'zustand'

type Store = {
  token: string
  username: string
  setAuth: (token: string, username: string) => void
  logout: () => void
}

const useStore = create<Store>(set => ({ 
	token: '', 
	username: '', 
	setAuth: (token, username) => { set({ token, username }) }, 
	logout: () => { set({ token: '', username: '' }) }
}))

export { useStore }