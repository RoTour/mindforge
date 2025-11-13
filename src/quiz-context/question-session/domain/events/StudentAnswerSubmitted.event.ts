// src/quiz-context/question-session/domain/events/StudentAnswerSubmitted.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class StudentAnswerSubmitted implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'StudentAnswerSubmitted';
	public readonly payload: {
		questionSessionId: string;
		studentId: string;
		answerText: string;
	};

	constructor(questionSessionId: string, studentId: string, answerText: string) {
		this.occurredOn = new Date();
		this.payload = {
			questionSessionId,
			studentId,
			answerText
		};
	}
}
