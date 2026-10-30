import { z } from "zod"

// create one schema for each line in database (ZUser-användare, ZChannel-kanal, ZMessage-meddelande)

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