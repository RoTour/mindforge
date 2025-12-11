// src/quiz-context/question-session/application/CreateLiveSessionUsecase.ts
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSession } from '../domain/LiveSession.entity';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type CreateLiveSessionCommand = {
	id?: string;
	promotionId: string;
	questionIds: string[];
	scheduledDate: Date;
	endsAt: Date;
	lockPreviousOnUnlock?: boolean;
};

export class CreateLiveSessionUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: CreateLiveSessionCommand): Promise<string> {
		const questionIds = command.questionIds.map((id) => new QuestionId(id));

		const newSession = LiveSession.create({
			id: command.id ? new LiveSessionId(command.id) : undefined,
			promotionId: new PromotionId(command.promotionId),
			questionIds,
			scheduledDate: command.scheduledDate,
			endsAt: command.endsAt,
			lockPreviousOnUnlock: command.lockPreviousOnUnlock ?? false
		});

		await this.liveSessionRepository.save(newSession);

		// Publish domain events from the aggregate
		for (const event of newSession.getDomainEvents()) {
			await DomainEventPublisher.publish(event);
		}
		newSession.clearDomainEvents();

		return newSession.id.id();
	}
}
