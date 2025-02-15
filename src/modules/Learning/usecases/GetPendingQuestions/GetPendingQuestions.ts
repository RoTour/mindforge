// @modules/Learning/usecases/GetPendingQuestions.ts
import {
	UseCaseResponseBuilder,
	type InputFactory,
	type OutputFactory,
	type UseCase
} from '$lib/arch/UseCase';
import type { Question } from '@modules/Learning/entities/Question';
import * as IGetPendingQuestionsRepository from '@modules/Learning/usecases/GetPendingQuestions/repositories/IGetPendingQuestionsRepository';
import { DateTime } from 'luxon';

type Input = InputFactory<
	{
		userId: string;
	},
	{
		getUserQuestions: IGetPendingQuestionsRepository.GetUserQuestions;
	}
>;

type Output = OutputFactory<{
	pendingQuestions: Question[];
}>;

const durationsByStreak: Record<string, { days: number }> = {
	'1': { days: 1 },
	'2': { days: 2 },
	'3': { days: 3 },
	'4': { days: 5 },
	'5': { days: 8 },
	'6': { days: 13 },
	'7': { days: 21 },
	'8': { days: 34 },
	'9': { days: 55 },
	'10': { days: 89 }
};

export const GetPendingQuestions: UseCase<Input, Output> = ({ getUserQuestions }) => {
	return {
		execute: async ({ userId }) => {
			const questions = await getUserQuestions(userId);
			const results = questions.filter((question) => {
				if (!question.lastAttemptDate) return true;
				const lastAttemptDate = DateTime.fromISO(new Date(question.lastAttemptDate).toISOString());
				const daysSinceLastAttempt = DateTime.now().diff(lastAttemptDate, 'days').days;
				console.debug('GetPendingQuestions - Question:', {
					question,
					daysSinceLastAttempt,
					days: durationsByStreak[`${question.successStreak}`],
					bool: daysSinceLastAttempt > durationsByStreak[`${question.successStreak}`].days
				});
				return daysSinceLastAttempt >= durationsByStreak[`${question.successStreak}`].days;
			});
			console.debug('GetPendingQuestions - Questions:', { questions, results });
			return UseCaseResponseBuilder.success(200, { pendingQuestions: results });
		}
	};
};
