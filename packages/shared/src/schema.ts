import { z } from "zod"

// ZChannnel = checklista 
export const ZChannel = z.object ({
  pk: z.string(),
  sk: z.string(),
  createdBy: z.string(),
  isLocked: z.boolean(), 
})

// z.infer = typescript får Channel (inte skriva två gånger)
export type Channel = z.infer<typeof ZChannel>

export const ZUser = z.object ({
  pk: z.string(),
  sk: z.string(),
  passwordHash: z.string(),
})

export type User = z.infer<typeof ZUser>

export const ZMessage = z.object ({
  pk: z.string(),
  sk: z.string(),
  sender: z.string(),
  text: z.string(),
})

export type Message = z.infer<typeof ZMessage>

export const ZNewMessage = z.object ({
  text: z.string().min(1),
})

export type NewMessage = z.infer<typeof ZNewMessage>

export const ZCredentials = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
})

export type Credentials = z.infer<typeof ZCredentials>

export const ZLoginResponse = z.object({
	token: z.string(),
})

export type LoginResponse = z.infer<typeof ZLoginResponse>

export const ZSummaryResponse = z.object({
	summary: z.string(),
})

export const ZUsernames = z.array(z.string())
export const ZMessages = z.array(ZMessage)

export const ZNewChannel = z.object({
	name: z.string().trim().min(1).max(30).regex(/^[a-zA-Z0-9åäöÅÄÖ -]+$/),
	isLocked: z.boolean(),
})

export const ZChannels = z.array(ZChannel)