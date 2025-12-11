// src/quiz-context/question-session/application/CloseLiveSessionUsecase.ts
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type CloseLiveSessionCommand = {
	liveSessionId: string;
};

export class CloseLiveSessionUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: CloseLiveSessionCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Live session not found');
		}

		session.close();

		await this.liveSessionRepository.save(session);

		// Publish any domain events from the aggregate
		for (const event of session.getDomainEvents()) {
			await DomainEventPublisher.publish(event);
		}
		session.clearDomainEvents();
	}
}
