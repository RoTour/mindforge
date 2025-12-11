// src/quiz-context/question-session/domain/ILiveSessionRepository.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { Answer } from './Answer.entity';
import type { LiveSession } from './LiveSession.entity';
import type { LiveSessionId } from './LiveSessionId.valueObject';

export interface ILiveSessionRepository {
	save(session: LiveSession): Promise<void>;
	saveAnswer(session: LiveSession, slotOrder: number, answer: Answer): Promise<void>;
	findById(id: LiveSessionId): Promise<LiveSession | null>;
	findByIdForStudent(id: LiveSessionId, studentId: StudentId): Promise<LiveSession | null>;
	findActiveByPromotionId(promotionId: PromotionId): Promise<LiveSession[]>;
	findActiveByPromotionIdForStudent(
		promotionId: PromotionId,
		studentId: StudentId
	): Promise<LiveSession[]>;
}
