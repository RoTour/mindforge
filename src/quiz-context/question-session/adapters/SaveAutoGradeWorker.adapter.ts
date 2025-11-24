import { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import { Worker, type WorkerOptions } from 'bullmq';
import { SaveAutoGradeUsecase } from '../application/SaveAutoGradeUsecase';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';

export const startSaveAutoGradeWorker = (
	connection: WorkerOptions['connection'],
	questionSessionRepository: IQuestionSessionRepository,
	concurrency = 50
) => {
	const usecase = new SaveAutoGradeUsecase(questionSessionRepository);

	const worker = new Worker(
		SaveAutoGradeCommand.type,
		async (job) => {
			console.log(`Processing save auto-grade job ${job.id}`);
			await usecase.execute(job.data);
		},
		{ connection, concurrency }
	);

	worker.on('completed', (job) => {
		console.log(`Save auto-grade job ${job.id} completed.`);
	});

	worker.on('failed', (job, err) => {
		console.error(`Save auto-grade job ${job?.id} failed: ${err.message}`);
	});

	return worker;
};
