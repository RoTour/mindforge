// src/quiz-context/question-session/application/AcceptAnswerUsecase.ts
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';
import { v7 as randomUUIDv7 } from 'uuid';

export type AcceptAnswerCommand = {
	liveSessionId: string;
	slotOrder: number;
	studentId: string;
	answerText: string;
};

// Ligthweight usecase that enqueues a job to process the student's answer
// This delegate update of LiveSession to the queue to avoid concurrency issues
export class AcceptAnswerUsecase {
	constructor(private readonly mq: IMessageQueue) {}

	async execute(command: AcceptAnswerCommand): Promise<any> {
		const processCommand = new ProcessStudentAnswerCommand(command);
		return this.mq.add({
			name: ProcessStudentAnswerCommand.type,
			data: processCommand.payload,
			opts: {
				jobId: `${command.liveSessionId}-${command.slotOrder}-${command.studentId}-${randomUUIDv7()}`
			}
		});
	}
}

