// src/quiz-context/promotion/application/listeners/ScheduleSessionOnPromotionQuestionPlanned.ts
// NOTE: This listener may need business review for the new LiveSession flow.
// The new model has teacher manually unlocking questions, not scheduling individual sessions.

import type { IMessageQueue } from '$ddd/interfaces/IMessageQueue';
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import type { CreateLiveSessionUsecase } from '$quiz/question-session/application/CreateLiveSessionUsecase';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';

export class ScheduleSessionOnPromotionQuestionPlanned implements IDomainEventListener {
	constructor(
		private readonly mq: IMessageQueue,
		private readonly createLiveSessionUsecase: CreateLiveSessionUsecase
	) {}

	public async handle(event: PromotionQuestionPlanned): Promise<void> {
		if (!(event instanceof PromotionQuestionPlanned)) return;

		const { promotionId, questionId, startingOn, endingOn } = event.payload;
		console.debug('Listener handling payload', event.payload);

		// Always create a LiveSession immediately (in PENDING state)
		// The session can be started manually by the teacher or auto-started at scheduledDate
		console.log(`Creating LiveSession for question ${questionId} (scheduled: ${startingOn.toISOString()})`);
		await this.createLiveSessionUsecase.execute({
			promotionId,
			questionIds: [questionId],
			scheduledDate: startingOn,
			endsAt: endingOn
		});
	}
}

