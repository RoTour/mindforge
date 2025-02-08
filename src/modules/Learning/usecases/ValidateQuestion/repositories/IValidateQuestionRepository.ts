import type { Question, QuestionType } from '@modules/Learning/entities/Question';
import type { IQuestionValidationService } from '../services/IQuestionValidationService';

export type GetQuestionToValidate = (questionId: string) => Promise<Question>;
export type QuestionValidationServiceProvider = (type?: QuestionType) => IQuestionValidationService;
