// src/quiz-context/question-session/domain/events/LiveSessionStarted.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class LiveSessionStarted implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'LiveSessionStarted';
	public readonly payload: {
		liveSessionId: string;
		promotionId: string;
	};

	constructor(liveSessionId: string, promotionId: string) {
		this.occurredOn = new Date();
		this.payload = {
			liveSessionId,
			promotionId
		};
	}
}
