// src/quiz-context/question/application/queries/IStudentQuestionQueries.ts
import type { QuestionId } from '../../domain/QuestionId.valueObject';

export type QuestionDetailsDTO = {
	id: string;
	text: string;
};

export interface IStudentQuestionQueries {
	getQuestionDetails(questionId: QuestionId): Promise<QuestionDetailsDTO | null>;
}
