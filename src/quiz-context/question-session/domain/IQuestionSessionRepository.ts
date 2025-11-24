// src/quiz-context/domain/interfaces/IQuestionSessionRepository.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { Answer } from './Answer.entity';
import type { QuestionSession } from './QuestionSession.entity';
import type { QuestionSessionId } from './QuestionSessionId.valueObject';

export interface IQuestionSessionRepository {
	save(session: QuestionSession): Promise<void>;
	saveAnswer(session: QuestionSession, answer: Answer): Promise<void>;
	findById(id: QuestionSessionId): Promise<QuestionSession | null>;
	findByIdForStudent(id: QuestionSessionId, studentId: StudentId): Promise<QuestionSession | null>;
	findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession[]>;
	findActiveByPromotionIdForStudent(
		promotionId: PromotionId,
		studentId: StudentId
	): Promise<QuestionSession[]>;
}
