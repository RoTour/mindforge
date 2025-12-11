// src/quiz-context/question-session/adapters/SaveAutoGradeWorker.adapter.ts
import { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import { Worker, type WorkerOptions } from 'bullmq';
import { SaveAutoGradeUsecase } from '../application/SaveAutoGradeUsecase';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';

export const startSaveAutoGradeWorker = (
	connection: WorkerOptions['connection'],
	liveSessionRepository: ILiveSessionRepository,
	concurrency = 50
) => {
	const usecase = new SaveAutoGradeUsecase(liveSessionRepository);

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

