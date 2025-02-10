// @modules/Learning/entities/Question.ts
import { z } from 'zod';

export const QuestionType = z.enum(['TRUE_FALSE', 'MULTIPLE_CHOICES', 'SIMPLE']);

export const QuestionSchema = z.object({
	id: z.string().uuid(),
	conceptId: z.string().uuid().optional(),
	prompt: z.string(),
	answer: z.string(),
	lastAttemptDate: z.string().datetime().optional().or(z.number().int()),
	successStreak: z.number(),
	intervalModifier: z.number(),
	options: z.array(z.string()).optional(),
	type: QuestionType
});

export const CreateQuestionDtoSchema = QuestionSchema.omit({
	id: true,
	conceptId: true,
	lastAttemptDate: true,
	successStreak: true,
	intervalModifier: true
}).extend({
	id: z.string().uuid().optional(),
});

export type QuestionType = z.infer<typeof QuestionType>;
export type Question = z.infer<typeof QuestionSchema>;
export type CreateQuestionDto = z.infer<typeof CreateQuestionDtoSchema>;