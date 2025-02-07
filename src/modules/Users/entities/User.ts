import { z } from 'zod';

export const UserSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string(),
	// settings: z.object({}),
});

export type User = z.infer<typeof UserSchema>;

// 👤 User
// Stores user-specific learning data.

// id (UUID)
// name (string)
// email (string)
// settings (UserSettings)