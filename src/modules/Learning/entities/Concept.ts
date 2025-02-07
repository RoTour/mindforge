import { z } from 'zod';
import { QuestionSchema } from './Question';

export const ConceptSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	questions: z.array(QuestionSchema),
	currentInterval: z.number(),
	nextReviewDate: z.string().date(),
});

export type Concept = z.infer<typeof ConceptSchema>;
