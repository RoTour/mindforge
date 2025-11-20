import type { Grade } from './Grade.valueObject';

export interface IGradingService {
	gradeAnswer(questionText: string, answerText: string, keyNotions?: any): Promise<Grade>;
}
