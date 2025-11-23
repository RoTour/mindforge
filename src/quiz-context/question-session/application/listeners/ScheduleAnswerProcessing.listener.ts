// src/quiz-context/question-session/application/listeners/ScheduleAnswerProcessing.listener.ts
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import { AutoGradeAnswerCommand } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import type { StudentAnswerSubmitted } from '$quiz/question-session/domain/events/StudentAnswerSubmitted.event';

export class ScheduleAnswerProcessingOnStudentAnswerSubmitted implements IDomainEventListener {
	constructor(private readonly mq: IMessageQueue) {}

	public async handle(event: StudentAnswerSubmitted): Promise<void> {
		const command = new AutoGradeAnswerCommand({
			questionSessionId: event.payload.questionSessionId,
			studentId: event.payload.studentId
		});
		await this.mq.add({
			name: AutoGradeAnswerCommand.type,
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
