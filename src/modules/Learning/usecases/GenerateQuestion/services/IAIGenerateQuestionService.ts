import type { CreateQuestionDto } from '@modules/Learning/entities/Question';

export type IAIGenerateQuestionService = {
	generateQuestions: (topic: string) => Promise<CreateQuestionDto[]>;
}