// src/quiz-context/promotion/domain/events/PromotionQuestionPlanned.event.ts
import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';

export class PromotionQuestionPlanned implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly payload;
	public readonly type = 'PromotionQuestionPlanned';

	constructor(promotionId: string, questionId: string, startingOn: Date) {
		this.occurredOn = new Date();
		this.payload = {
			promotionId,
			questionId,
			startingOn
		};
	}
}
