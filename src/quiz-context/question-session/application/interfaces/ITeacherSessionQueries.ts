// src/quiz-context/question-session/application/interfaces/ITeacherSessionQueries.ts
import type { LiveSessionStatus } from '$quiz/question-session/domain/LiveSession.entity';

export type SlotListItem = {
	order: number;
	questionId: string;
	questionText: string;
	status: 'LOCKED' | 'UNLOCKED' | 'CLOSED';
	answerCount: number;
};

export type SessionListItem = {
	id: string;
	status: LiveSessionStatus;
	scheduledDate: Date;
	endsAt: Date;
	questionCount: number;
	slots: SlotListItem[];
	currentUnlockedSlotOrder: number | null;
};

export interface ITeacherSessionQueries {
	getSessionsForPromotion(promotionId: string): Promise<SessionListItem[]>;
}
