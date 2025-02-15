import type { IAIGenerateQuestionService } from '../services/IAIGenerateQuestionService';
import * as IGenerateQuestionRepository from './IGenerateQuestionsRepository';

type _AIProviderRepository = {
	generateQuestions: IGenerateQuestionRepository.GenerateQuestionsFromTopic;
};

export const AIProviderRepository = (
	aiService: IAIGenerateQuestionService
): _AIProviderRepository => {
	return {
		generateQuestions: aiService.generateQuestions
	};
};
