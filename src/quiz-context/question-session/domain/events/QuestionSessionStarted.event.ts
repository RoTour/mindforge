// src/quiz-context/question-session/domain/events/QuestionSessionStarted.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class QuestionSessionStarted implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'QuestionSessionStarted';
	public readonly payload: {
		questionSessionId: string;
		promotionId: string;
	};

	constructor(questionSessionId: string, promotionId: string) {
		this.occurredOn = new Date();
		this.payload = {
			questionSessionId,
			promotionId
		};
	}
}
