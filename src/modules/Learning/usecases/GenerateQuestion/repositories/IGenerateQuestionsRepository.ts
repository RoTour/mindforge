import type { CreateQuestionDto } from '@modules/Learning/entities/Question';

export type GenerateQuestionsFromTopic = (topic: string) => Promise<CreateQuestionDto[]>;