import { AutoGradeAnswerCommand } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import type { IQuestionRepository } from '$quiz/question/domain/IQuestionRepository';
import { Worker, type WorkerOptions } from 'bullmq';
import { AutoGradeAnswerUsecase } from '../application/AutoGradeAnswer.usecase';
import type { IGradingService } from '../domain/IGradingService';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';

export const startAutoGradeAnswerWorker = (
	connection: WorkerOptions['connection'],
	questionSessionRepository: IQuestionSessionRepository,
	questionRepository: IQuestionRepository,
	gradingService: IGradingService
) => {
	const usecase = new AutoGradeAnswerUsecase(
		questionSessionRepository,
		questionRepository,
		gradingService
	);

	const worker = new Worker(
		AutoGradeAnswerCommand.type,
		async (job) => {
			console.log(`Processing auto-grading job ${job.id}`);
			await usecase.execute(job.data);
		},
		{ connection }
	);

	worker.on('completed', (job) => {
		console.log(`Auto-grading job ${job.id} completed.`);
	});

	worker.on('failed', (job, err) => {
		console.error(`Auto-grading job ${job.id} failed: ${err.message}`);
	});

	return worker;
};
