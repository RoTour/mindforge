// src/quiz-context/student/application/interfaces/IUnlinkedStudentsQueries.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

export type UnlinkedStudentDTO = {
	id: string;
	name: string;
	lastName: string | null;
};

export interface IUnlinkedStudentsQueries {
	getUnlinkedStudents(promotionId: PromotionId): Promise<UnlinkedStudentDTO[]>;
}
