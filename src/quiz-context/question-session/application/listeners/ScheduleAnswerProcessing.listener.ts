// src/quiz-context/question-session/application/listeners/ScheduleAnswerProcessing.listener.ts
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';
import type { StudentAnswerSubmitted } from '$quiz/question-session/domain/events/StudentAnswerSubmitted.event';

export class ScheduleAnswerProcessingOnStudentAnswerSubmitted implements IDomainEventListener {
	constructor(private readonly mq: IMessageQueue) {}

	public async handle(event: StudentAnswerSubmitted): Promise<void> {
		const command = new ProcessStudentAnswerCommand(event.payload);
		await this.mq.add({
			name: ProcessStudentAnswerCommand.type,
			data: command.payload,
			opts: {
				jobId: `${event.payload.questionSessionId}-${event.payload.studentId}`
			}
		});
		console.log(
			`Scheduled BullMQ job for processing answer for student ${event.payload.studentId} on session ${event.payload.questionSessionId}`
		);
	}
}
