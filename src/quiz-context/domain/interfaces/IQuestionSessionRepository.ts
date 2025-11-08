// src/quiz-context/domain/interfaces/IQuestionSessionRepository.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { QuestionSession } from '../QuestionSession.entity';
import type { QuestionSessionId } from '../QuestionSessionId.valueObject';

export interface IQuestionSessionRepository {
	save(session: QuestionSession): Promise<void>;
	findById(id: QuestionSessionId): Promise<QuestionSession | null>;
	findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession | null>;
}
