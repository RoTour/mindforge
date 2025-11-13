// src/quiz-context/student/application/queries/IStudentQueries.ts
import type { StudentPromotionDto } from '../dtos/StudentPromotionsDto';

export interface IStudentQueries {
	isStudentInPromotion(authUserId: string, promotionId: string): Promise<boolean>;
	getStudentIdByAuthUserId(authUserId: string): Promise<string | null>;
	getStudentPromotions(studentId: string): Promise<StudentPromotionDto[]>;
	getStudentSummaryStats(studentId: string): Promise<StudentSummaryStatsDto>;
}
