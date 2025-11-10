// src/quiz-context/question-session/domain/events/QuestionSessionStarted.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class QuestionSessionStarted implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'QuestionSessionStarted';

	constructor(
		public readonly questionSessionId: string,
		public readonly promotionId: string
	) {
		this.occurredOn = new Date();
	}
}
