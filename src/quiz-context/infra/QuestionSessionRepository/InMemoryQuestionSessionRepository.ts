// src/quiz-context/infra/QuestionSessionRepository/InMemoryQuestionSessionRepository.ts
import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { QuestionSession } from '$quiz/domain/QuestionSession.entity';
import type { QuestionSessionId } from '$quiz/domain/QuestionSessionId.valueObject';
import type { IQuestionSessionRepository } from '$quiz/domain/interfaces/IQuestionSessionRepository';

export class InMemoryQuestionSessionRepository implements IQuestionSessionRepository {
	private readonly sessions = new Map<string, QuestionSession>();

	async save(session: QuestionSession): Promise<void> {
		this.sessions.set(session.id.id(), session);
	}

	async findById(id: QuestionSessionId): Promise<QuestionSession | null> {
		return this.sessions.get(id.id()) ?? null;
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession | null> {
		const session = Array.from(this.sessions.values()).find(
			(s) => s.promotionId.equals(promotionId) && s.status === 'ACTIVE'
		);
		return session ?? null;
	}
}
