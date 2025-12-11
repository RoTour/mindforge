// src/quiz-context/question-session/application/interfaces/ITeacherAnswersQueries.ts
export type AnswerListItem = {
	studentId: string;
	studentName: string;
	questionId: string;
	questionText: string;
	answerText: string;
	submittedAt: Date;
	liveSessionId: string;
	slotOrder: number;
	autoGrade?: {
		score: number;
		status: 'PENDING' | 'COMPLETED' | 'FAILED';
		skillsMastered: string[];
		skillsToReinforce: string[];
		comment: string | null;
	};
	teacherGrade: {
		score: number;
		skillsMastered: string[];
		skillsToReinforce: string[];
		comment: string | null;
	} | null;
	isPublished: boolean;
};

export interface ITeacherAnswersQueries {
	getAnswersForPromotion(promotionId: string): Promise<AnswerListItem[]>;
}

