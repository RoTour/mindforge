import type { Question } from '../../../entities/Question';

export type IQuestionValidationService = {
	validate: (question: Question, proposition: string) => boolean
}