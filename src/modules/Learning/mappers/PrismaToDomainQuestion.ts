import { type Question as PrismaQuestion } from "@prisma/client";
import type { Question as DomainQuestion } from '../entities/Question';

export const PrismaToDomainQuestion = (question: PrismaQuestion): DomainQuestion => {
	return {
		id: question.id,
		prompt: question.prompt,
		answer: question.answer,
		type: question.questionType,
		options: question.options.map((option) => option.split(',')).flat(),
		intervalModifier: question.intervalModifier,
		successStreak: question.successStreak,
		lastAttemptDate: question.lastAttemptDate?.toISOString()
	}
}