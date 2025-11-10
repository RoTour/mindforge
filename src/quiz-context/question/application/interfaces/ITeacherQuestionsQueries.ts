// src/quiz-context/question/application/interfaces/ITeacherQuestionsQueries.ts
import type { KeyNotionProps } from '$quiz/question/domain/KeyNotion.valueObject';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

export type TeacherQuestionDTO = {
	id: string;
	text: string;
	authorId: string;
	keyNotions: KeyNotionProps[];
};

export type PlannedQuestionDTO = {
	id: string;
	questionId: string;
	text: string;
	authorId: string;
	keyNotions: KeyNotionProps[];
	startingOn: Date | null;
	endingOn: Date | null;
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

	/**
	 * Fetches all questions that are planned for a specific promotion.
	 */
	getPlannedQuestionsForPromotion(
		promotionId: PromotionId,
		teacherId: TeacherId
	): Promise<PlannedQuestionDTO[]>;
}
