// @modules/Learning/entities/Question.ts
import { z } from 'zod';

export const QuestionType = z.enum(['TRUE_FALSE', 'MULTIPLE_CHOICES', 'SIMPLE']);

export const QuestionSchema = z.object({
	id: z.string().uuid(),
	conceptId: z.string().uuid().optional(),
	prompt: z.string(),
	answer: z.string(),
	lastAttemptDate: z.string().date().optional(),
	successStreak: z.number(),
	intervalModifier: z.number(),
	options: z.array(z.string()).optional(),
	type: QuestionType
});

export const CreateQuestionDto = QuestionSchema.omit({
	id: true,
	conceptId: true,
	lastAttemptDate: true,
	successStreak: true,
	intervalModifier: true
});

export type Question = z.infer<typeof QuestionSchema>;
export type CreateQuestionDto = z.infer<typeof CreateQuestionDto>;