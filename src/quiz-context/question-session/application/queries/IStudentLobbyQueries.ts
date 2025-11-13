// src/quiz-context/question-session/application/queries/IStudentLobbyQueries.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

export type ActiveQuestionSessionDTO = {
	id: string;
	questionId: string;
	endsAt: Date;
};

export interface IStudentLobbyQueries {
	getActiveQuestionSessions(promotionId: PromotionId): Promise<ActiveQuestionSessionDTO[]>;
}
