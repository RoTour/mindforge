import { z } from 'zod';

export const ReminderSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string().uuid(),
	concept_id: z.string().uuid(),
	scheduled_date: z.date(),
	status: z.enum(['pending', 'sent', 'skipped']),
});

export type Reminder = z.infer<typeof ReminderSchema>;

// 🔔 Reminder
// Handles scheduled question notifications.

// id (UUID)
// user_id (UUID)
// concept_id (UUID)
// scheduled_date (datetime)
// status (pending, sent, skipped)