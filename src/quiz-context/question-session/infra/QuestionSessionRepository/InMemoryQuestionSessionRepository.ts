// src/quiz-context/infra/QuestionSessionRepository/InMemoryQuestionSessionRepository.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { IQuestionSessionRepository } from '$quiz/question-session/domain/IQuestionSessionRepository';
import type { QuestionSession } from '$quiz/question-session/domain/QuestionSession.entity';
import type { QuestionSessionId } from '$quiz/question-session/domain/QuestionSessionId.valueObject';

export class InMemoryQuestionSessionRepository implements IQuestionSessionRepository {
	private readonly sessions = new Map<string, QuestionSession>();

	async save(session: QuestionSession): Promise<void> {
		this.sessions.set(session.id.id(), session);
	}

	async findById(id: QuestionSessionId): Promise<QuestionSession | null> {
		return this.sessions.get(id.id()) ?? null;
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession[]> {
		const sessions = Array.from(this.sessions.values()).filter(
			(s) => s.promotionId.equals(promotionId) && s.status === 'ACTIVE'
		);
		return sessions;
	}
}
