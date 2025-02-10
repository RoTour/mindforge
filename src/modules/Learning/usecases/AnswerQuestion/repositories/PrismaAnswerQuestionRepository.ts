import type { PrismaClient } from '@prisma/client';
import * as IAnswerQuestionRepository from './IAnswerQuestionRepository';

type _PrismaGetPendingQuestionsRepository = {
	getQuestion: IAnswerQuestionRepository.GetQuestion;
	saveQuestion: IAnswerQuestionRepository.SaveQuestion;
};

export const PrismaAnswerQuestionRepository = (
	prisma: PrismaClient
): _PrismaGetPendingQuestionsRepository => {
	return {
		getQuestion: async (id) => {
			const question = await prisma.question.findUnique({
				where: { id }
			});
			return question
				? {
						id: question.id,
						prompt: question.prompt,
						answer: question.answer,
						intervalModifier: question.intervalModifier,
						successStreak: question.successStreak,
						type: question.questionType,
						options: question.options,
						lastAttemptDate: question.lastAttemptDate?.toISOString()
					}
				: undefined;
		},
		saveQuestion: async (question) => {
			await prisma.question.update({
				where: { id: question.id },
				data: {
					prompt: question.prompt,
					answer: question.answer,
					questionType: question.type,
					options: question.options,
					lastAttemptDate: question.lastAttemptDate ? new Date(question.lastAttemptDate) : undefined,
					successStreak: question.successStreak,
					intervalModifier: question.intervalModifier
				}
			});
		}
	};
};
