// src/quiz-context/question-session/application/listeners/ScheduleAutoGrading.listener.ts
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import { AutoGradeAnswerCommand } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import type { StudentAnswerSubmitted } from '$quiz/question-session/domain/events/StudentAnswerSubmitted.event';

export class ScheduleAutoGradingOnStudentAnswerSubmitted implements IDomainEventListener {
	constructor(private readonly mq: IMessageQueue) {}

	public async handle(event: StudentAnswerSubmitted): Promise<void> {
		const command = new AutoGradeAnswerCommand({
			liveSessionId: event.payload.liveSessionId,
			slotOrder: event.payload.slotOrder,
			studentId: event.payload.studentId
		});
		await this.mq.add({
			name: AutoGradeAnswerCommand.type,
			data: command.payload,
			opts: {
				jobId: `grade-${event.payload.liveSessionId}-${event.payload.slotOrder}-${event.payload.studentId}`
			}
		});
		console.log(
			`Scheduled BullMQ job for auto-grading answer for student ${event.payload.studentId} on session ${event.payload.liveSessionId}`
		);
	}
}

