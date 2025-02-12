// $modules/Learning/gateways/ILearningGateways.ts
import type { UseCaseResponse } from '$lib/arch/UseCase';
import type { CreateQuestionDto, Question } from '../entities/Question';
import * as IValidateQuestionRepository from '../usecases/ValidateQuestion/repositories/IValidateQuestionRepository';
import * as ICreateQuestionRepository from '../usecases/CreateQuestion/repositories/ICreateQuestionRepository';

export type ILearningGateway = {
	createQuestion: (dto: CreateQuestionDto) => Promise<UseCaseResponse<Question>>;
	getUserQuestions: (userId: string) => Promise<Question[]>;
	saveQuestion: (question: Question) => Promise<void>;
	getQuestion: (id: string) => Promise<Question | undefined>;
	getQuestionToValidate: IValidateQuestionRepository.GetQuestionToValidate;
	storeQuestion: ICreateQuestionRepository.StoreQuestion;
};
