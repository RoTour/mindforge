import { Grade } from '$quiz/question-session/domain/Grade.valueObject';
import type { IGradingService } from '$quiz/question-session/domain/IGradingService';

export class MockGradingService implements IGradingService {
	async gradeAnswer(questionText: string, answerText: string, keyNotions?: any): Promise<Grade> {
		// Simulate some processing time
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return new Grade({
			skillsMastered: ['Mock Skill 1', 'Mock Skill 2'],
			skillsToReinforce: ['Mock Skill 3'],
			comment: 'This is a mock grade generated for load testing.'
		});
	}
}
