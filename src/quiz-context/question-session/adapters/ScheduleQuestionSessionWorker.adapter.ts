import { Worker, type WorkerOptions } from 'bullmq';
import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';

export const startScheduleQuestionSessionWorker = (connection: WorkerOptions['connection']) => {
	// const questionSessionRepository = ServiceProvider.QuestionSessionRepository(prisma);
	// const questionSessionCreator = new CreateQuestionSessionUsecase(questionSessionRepository);

	const worker = new Worker(
		ScheduleQuestionSessionCommand.type,
		async (job) => {
			const { promotionId, questionId } = job.data;
			console.log(
				`Processing job ${job.id}: Starting session for question ${questionId} in promotion ${promotionId}`
			);

			// await questionSessionCreator.run(promotionId, questionId);
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
