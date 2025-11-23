// src/quiz-context/question-session/application/CreateQuestionSessionUsecase.ts

import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { QuestionSessionStarted } from '../domain/events/QuestionSessionStarted.event';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSession } from '../domain/QuestionSession.entity';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

// Command object for the use case
export type CreateQuestionSessionCommand = {
	id?: string;
	promotionId: string;
	questionId: string;
	startedAt: Date;
	endsAt: Date;
};

export class CreateQuestionSessionUsecase {
	constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

	async execute(command: CreateQuestionSessionCommand): Promise<void> {
		const newSession = QuestionSession.create({
			id: command.id ? new QuestionSessionId(command.id) : undefined,
			promotionId: new PromotionId(command.promotionId),
			questionId: new QuestionId(command.questionId),
			startedAt: command.startedAt,
			endsAt: command.endsAt
		});

		// A session created this way should be immediately active.
		newSession.start();

		await this.questionSessionRepository.save(newSession);

		// Publish an event to notify other parts of the system (e.g., WebSockets)
		DomainEventPublisher.publish(
			new QuestionSessionStarted(newSession.id.id(), newSession.promotionId.id())
		);
	}
}
