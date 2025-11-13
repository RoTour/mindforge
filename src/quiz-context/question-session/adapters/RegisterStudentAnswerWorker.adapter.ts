// src/quiz-context/question-session/adapters/RegisterStudentAnswerWorker.adapter.ts
import { Worker, type WorkerOptions } from 'bullmq';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import {
	RegisterStudentAnswerUsecase,
	type RegisterStudentAnswerCommand
} from '../application/RegisterStudentAnswerUsecase';

export const startRegisterStudentAnswerWorker = (
	connection: WorkerOptions['connection'],
	questionSessionRepository: IQuestionSessionRepository
) => {
	const usecase = new RegisterStudentAnswerUsecase(questionSessionRepository);

	const worker = new Worker(
		ProcessStudentAnswerCommand.type,
		async (job) => {
			const { questionSessionId, studentId, answerText } =
				job.data as RegisterStudentAnswerCommand;
			console.log(
				`Processing job ${job.id}: Registering answer for student ${studentId} in session ${questionSessionId}`
			);

			await usecase.execute({
				questionSessionId,
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
