export type GradedQuestionItem = {
	questionId: string;
	questionText: string;
	submittedAt: Date;
	grade: {
		score: number;
		skillsMastered: string[];
		skillsToReinforce: string[];
		comment: string | null;
	};
};

export type StudentSkills = {
	mastered: string[];
	toReinforce: string[];
};

export interface IStudentDashboardQueries {
	getLastGradedQuestions(studentId: string, limit: number): Promise<GradedQuestionItem[]>;
	getStudentSkills(studentId: string): Promise<StudentSkills>;
}
