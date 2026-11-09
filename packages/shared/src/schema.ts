import { z } from "zod"


export const ZChannel = z.object ({
  pk: z.string(),
  sk: z.string(),
  createdBy: z.string(),
  isLocked: z.boolean(), 
})

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
  sender: z.string(),
  text: z.string().min(1),
})

export type NewMessage = z.infer<typeof ZNewMessage>

export const ZCredentials = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
})

export type Credentials = z.infer<typeof ZCredentials>