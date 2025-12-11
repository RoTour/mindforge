// src/quiz-context/question-session/application/UnlockQuestionSlotUsecase.ts
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type UnlockQuestionSlotCommand = {
	liveSessionId: string;
	slotOrder: number;
};

export class UnlockQuestionSlotUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: UnlockQuestionSlotCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Live session not found');
		}

		session.unlockSlot(command.slotOrder);

		await this.liveSessionRepository.save(session);

		// Publish domain events from the aggregate
		for (const event of session.getDomainEvents()) {
			await DomainEventPublisher.publish(event);
		}
		session.clearDomainEvents();
	}
}
