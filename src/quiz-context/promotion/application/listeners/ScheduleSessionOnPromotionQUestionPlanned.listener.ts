// src/quiz-context/promotion/application/listeners/ScheduleSessionOnPromotionQuestionPlanned.ts

import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';
import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';
import type { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';
import type { IMessageQueue } from '$ddd/interfaces/IMessageQueue';

export class ScheduleSessionOnPromotionQuestionPlanned implements IDomainEventListener {
	constructor(
		private readonly mq: IMessageQueue,
		private readonly createQuestionSessionUsecase: CreateQuestionSessionUsecase
	) {}

	public async handle(event: PromotionQuestionPlanned): Promise<void> {
		if (!(event instanceof PromotionQuestionPlanned)) return;

		const { promotionId, questionId, startingOn, endingOn } = event.payload;
		const now = Date.now();
		const delay = startingOn.getTime() - now;

		if (delay > 0) {
			// The start time is in the future, schedule a delayed job.
			const command = new ScheduleQuestionSessionCommand({ promotionId, questionId, startingOn });
			await this.mq.add({
				name: ScheduleQuestionSessionCommand.type,
				data: command.payload(),
				opts: {
					delay,
					jobId: `${promotionId}-${questionId}` // Prevents duplicate jobs
				}
			});
			console.log(
				`Scheduled BullMQ job for question ${questionId} with delay ${delay}ms. (starts on ${startingOn.toISOString()})`
			);
		} else if (endingOn && endingOn.getTime() > now) {
			// The start time is in the past, but the end time is in the future.
			// This session should be active immediately.
			console.log(`Immediately creating session for question ${questionId}.`);
			await this.createQuestionSessionUsecase.execute({
				promotionId,
				questionId,
				startedAt: startingOn,
				endsAt: endingOn
			});
		}
	}
}
