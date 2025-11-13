// src/quiz-context/question-session/application/AcceptAnswerUsecase.ts
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';

export type AcceptAnswerCommand = {
	questionSessionId: string;
	studentId: string;
	answerText: string;
};

// Ligthweight usecase that enqueues a job to process the student's answer
// This delegate update of QuestionSession to the queue to avoid concurrency issues
export class AcceptAnswerUsecase {
	constructor(private readonly mq: IMessageQueue) {}

	async execute(command: AcceptAnswerCommand): Promise<any> {
		const processCommand = new ProcessStudentAnswerCommand(command);
		return this.mq.add({
			name: ProcessStudentAnswerCommand.type,
			data: processCommand.payload,
			opts: {
				// prevent duplicate jobs if a student submits multiple times quickly
				jobId: `${command.questionSessionId}-${command.studentId}`
			}
		});
	}
}
