import { Worker, type WorkerOptions } from 'bullmq';
import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';
import { CreateQuestionSessionUsecase } from '../application/CreateQuestionSessionUsecase';
import type { PromotionQuestionPlanned } from '$quiz/promotion/domain/events/PromotionQuestionPlanned.event';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';

export const startScheduleQuestionSessionWorker = (
	connection: WorkerOptions['connection'],
	questionSessionRepository: IQuestionSessionRepository
) => {
	const usecase = new CreateQuestionSessionUsecase(questionSessionRepository);

	const worker = new Worker(
		ScheduleQuestionSessionCommand.type,
		async (job) => {
			const { promotionId, questionId, endingOn, startingOn } =
				job.data as PromotionQuestionPlanned['payload'];
			console.log(
				`Processing job ${job.id}: Starting session for question ${questionId} in promotion ${promotionId} from ${startingOn} to ${endingOn}`
			);

			await usecase.execute({
				promotionId,
				questionId,
				startedAt: new Date(startingOn),
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
