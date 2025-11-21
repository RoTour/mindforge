export type AnswerListItem = {
	studentId: string;
	studentName: string;
	questionId: string;
	questionText: string;
	answerText: string;
	submittedAt: Date;
	autoGrade?: {
		score: number; // Assuming score is derived from skills or just presence for now, checking Grade value object
		status: 'PENDING' | 'COMPLETED' | 'FAILED'; // We might need to infer this
	};
	teacherGrade?: {
		score: number;
	};
};

export interface ITeacherAnswersQueries {
	getAnswersForPromotion(promotionId: string): Promise<AnswerListItem[]>;
}
