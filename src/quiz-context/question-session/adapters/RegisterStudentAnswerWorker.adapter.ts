// src/quiz-context/question-session/adapters/RegisterStudentAnswerWorker.adapter.ts
import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';
import { Worker, type WorkerOptions } from 'bullmq';
import {
    RegisterStudentAnswerUsecase,
    type RegisterStudentAnswerCommand
} from '../application/RegisterStudentAnswerUsecase';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';

export const startRegisterStudentAnswerWorker = (
	connection: WorkerOptions['connection'],
	liveSessionRepository: ILiveSessionRepository,
	scheduleAutoGradingListener: IDomainEventListener
) => {
	const usecase = new RegisterStudentAnswerUsecase(
		liveSessionRepository,
		scheduleAutoGradingListener
	);

	const worker = new Worker(
		ProcessStudentAnswerCommand.type,
		async (job) => {
			const { liveSessionId, slotOrder, studentId, answerText } = job.data as RegisterStudentAnswerCommand;
			console.log(`Processing job: Registering answer for student in session`, {
				jobId: job.id,
				liveSessionId,
				slotOrder,
				studentId
			});

			await usecase.execute({
				liveSessionId,
				slotOrder,
				studentId,
				answerText
			});
		},
		{ connection }
	);

	worker.on('completed', (job) => {
		console.log(`Job ${job.id} has completed.`);
	});

	worker.on('ready', () => {
		console.log('Student answer registration worker is ready and listening for jobs !');
	});

	worker.on('failed', (job, err) => {
		if (job) {
			console.error(`Job ${job.id} has failed with error ${err.message}`);
		}
	});

	return worker;
};

