// src/quiz-context/student/application/queries/GetStudentPromotions.dto.ts
export interface StudentPromotionDto {
	id: string;
	name: string;
	description: string | null;
	progress: {
		completed: number;
		total: number;
	};
	studentCount: number;
	// Later: icon, color scheme
}
