export type StudentHistoryDTO = {
	student: {
		id: string;
		name: string;
		lastname?: string;
		email?: string;
	};
	answers: Array<{
		id: string;
		questionText: string;
		answerText: string;
		submittedAt: Date;
		grade?: number;
		assessment?: string;
		session: {
			startedAt: Date;
			status: string;
		};
	}>;
};

export interface IStudentHistoryQueries {
	getStudentHistory(
		studentId: string,
		promotionId: string
	): Promise<StudentHistoryDTO>;
}
