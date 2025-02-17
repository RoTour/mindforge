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
	timeBeforeNextQuestion: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	} | null;
}>;

const durationsByStreak: Record<string, { days?: number; hours?: number }> = {
	'0': { hours: 8 },
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
			const now = DateTime.now();

			// Calculate next available time for each non-pending question
			const nextAvailableTimes = questions
				.filter((question) => question.lastAttemptDate)
				.map((question) => {
					const lastAttemptDate = DateTime.fromISO(new Date(question.lastAttemptDate ?? '').toISOString());
					const duration = durationsByStreak[`${question.successStreak}`];

					if (!duration) return null;

					return lastAttemptDate.plus(duration);
				})
				.filter((time): time is DateTime => time !== null); // Type predicate to ensure non-null values

			// Get pending questions
			const results = questions.filter((question) => {
				if (!question.lastAttemptDate) return true;

				const lastAttemptDate = DateTime.fromISO(new Date(question.lastAttemptDate).toISOString());
				const duration = durationsByStreak[`${question.successStreak}`];

				if (!duration) {
					console.warn('GetPendingQuestions - No duration found for question:', question);
					return false;
				}

				const waitUntil = lastAttemptDate.plus(duration);
				return now >= waitUntil;
			});

			// Calculate time before next question if there are no pending questions
			let timeBeforeNextQuestion = null;

			if (results.length === 0 && nextAvailableTimes.length > 0) {
				console.debug('GetPendingQuestions - Next question available cd');
				const nextQuestionTime = nextAvailableTimes.reduce((nearest, current) => {
					return !nearest || current < nearest ? current : nearest;
				});

				const timeLeft = nextQuestionTime.diff(now, ['days', 'hours', 'minutes', 'seconds']);
				console.debug('GetPendingQuestions - Time left:', timeLeft, nextQuestionTime, now)
				timeBeforeNextQuestion = {
					days: Math.floor(timeLeft?.days ?? 0),
					hours: Math.floor(timeLeft?.hours ?? 0),
					minutes: Math.floor(timeLeft?.minutes ?? 0),
					seconds: Math.floor(timeLeft?.seconds ?? 0),
				};
			}

			console.debug('GetPendingQuestions - Questions:', {
				questions,
				results,
				timeBeforeNextQuestion,
				nextAvailableTimes: nextAvailableTimes.map((t) => t.toISO())
			});

			return UseCaseResponseBuilder.success(200, {
				pendingQuestions: results,
				timeBeforeNextQuestion
			});
		}
	};
};
