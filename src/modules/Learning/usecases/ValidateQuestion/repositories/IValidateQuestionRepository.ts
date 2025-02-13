import type { Question, QuestionType } from '@modules/Learning/entities/Question';
import type { IQuestionValidationService } from '../services/IQuestionValidationService';

export type GetQuestionToValidate = (questionId: string) => Promise<Question | undefined>;
export type QuestionValidationServiceProvider = (type?: QuestionType) => IQuestionValidationService;
export type ExpectedAnswerFormatter = (question: Question) => string;