// src/quiz-context/question-session/domain/events/QuestionSlotUnlocked.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class QuestionSlotUnlocked implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'QuestionSlotUnlocked';
	public readonly payload: {
		liveSessionId: string;
		slotId: string;
		order: number;
	};

	constructor(liveSessionId: string, slotId: string, order: number) {
		this.occurredOn = new Date();
		this.payload = {
			liveSessionId,
			slotId,
			order
		};
	}
}

