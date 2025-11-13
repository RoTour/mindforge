// src/quiz-context/student/application/queries/IStudentQueries.ts
export interface IStudentQueries {
	isStudentInPromotion(authUserId: string, promotionId: string): Promise<boolean>;
	getStudentIdByAuthUserId(authUserId: string): Promise<string | null>;
}
