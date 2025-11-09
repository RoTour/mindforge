// src/quiz-context/promotion/application/listeners/ScheduleSessionOnPromotionQuestionPlanned.ts

import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';
import { quizMQ } from '$lib/server/bullmq/bullmq'; // your BullMQ queue instance

export class ScheduleSessionOnPromotionQuestionPlanned implements IDomainEventListener {
	public async handle(event: PromotionQuestionPlanned): Promise<void> {
		if (!(event instanceof PromotionQuestionPlanned)) return;

		// Ensure we are handling the correct event type
		console.log(`Reacting to PromotionQuestionPlanned event for question ${event.payload}`);

		const { promotionId, questionId, startingOn } = event.payload;
		const delay = startingOn.getTime() - Date.now();

		if (delay > 0) {
			await quizMQ.add(
				event.type,
				{ promotionId, questionId },
				{
					delay,
					jobId: `${promotionId}-${questionId}` // Prevents duplicate jobs
				}
			);
			console.log(`Scheduled BullMQ job for question ${questionId} with delay ${delay}ms.`);
		}
	}
}
