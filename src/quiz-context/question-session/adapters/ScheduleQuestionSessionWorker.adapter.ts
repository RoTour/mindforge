// src/quiz-context/question-session/adapters/ScheduleQuestionSessionWorker.adapter.ts
import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';
import type { PromotionQuestionPlanned } from '$quiz/promotion/domain/events/PromotionQuestionPlanned.event';
import { Worker, type WorkerOptions } from 'bullmq';
import { CreateLiveSessionUsecase } from '../application/CreateLiveSessionUsecase';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';

export const startScheduleQuestionSessionWorker = (
	connection: WorkerOptions['connection'],
	liveSessionRepository: ILiveSessionRepository
) => {
	const usecase = new CreateLiveSessionUsecase(liveSessionRepository);

	const worker = new Worker(
		ScheduleQuestionSessionCommand.type,
		async (job) => {
			const { promotionId, questionId, endingOn, startingOn } =
				job.data as PromotionQuestionPlanned['payload'];
			console.log(
				`Processing job : Starting session for question from ${startingOn} to ${endingOn}`,
				{
					jobId: job.id,
					promotionId,
					questionId
				}
			);

			// Create a LiveSession with this single question
			await usecase.execute({
				promotionId,
				questionIds: [questionId],
				scheduledDate: new Date(startingOn),
				endsAt: new Date(endingOn)
			});
		},
		{ connection }
	);

	worker.on('completed', (job) => {
		console.log(`Job ${job.id} has completed.`);
	});

	worker.on('ready', () => {
		console.log('Question scheduling worker is ready and listening for jobs !');
	});

	worker.on('failed', (job, err) => {
		if (job) {
			console.error(`Job ${job.id} has failed with error ${err.message}`);
		}
	});

	return worker;
};

