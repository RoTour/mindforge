// src/quiz-context/application/interfaces/ITeacherQuestionsQueries.ts
import type { KeyNotionProps } from '$quiz/domain/KeyNotion.valueObject';
import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export type TeacherQuestionDTO = {
	id: string;
	text: string;
	authorId: string;
	keyNotions: KeyNotionProps[];
};

export interface ITeacherQuestionsQueries {
	/**
	 * Fetches all questions that have been asked in a specific promotion by a given teacher.
	 */
	getOwnQuestionsForPromotion(
		promotionId: PromotionId,
		teacherId: TeacherId
	): Promise<TeacherQuestionDTO[]>;

	/**
	 * Fetches all questions ever created by a given teacher.
	 */
	getAllOwnQuestionsForTeacher(teacherId: TeacherId): Promise<TeacherQuestionDTO[]>;
}
