// src/quiz-context/question-session/application/StartLiveSessionUsecase.ts
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';
import { LiveSessionStarted } from '../domain/events/LiveSessionStarted.event';

export type StartLiveSessionCommand = {
	liveSessionId: string;
};

export class StartLiveSessionUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: StartLiveSessionCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Live session not found');
		}

		session.start();

		await this.liveSessionRepository.save(session);

		// Publish the session started event
		await DomainEventPublisher.publish(
			new LiveSessionStarted(session.id.id(), session.promotionId.id())
		);

		// Publish any domain events from the aggregate
		for (const event of session.getDomainEvents()) {
			await DomainEventPublisher.publish(event);
		}
		session.clearDomainEvents();
	}
}
