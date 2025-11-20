import { createOpenRouter, type OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';
import { z } from 'zod';
import { Grade } from '../domain/Grade.valueObject';
import type { IGradingService } from '../domain/IGradingService';
import type { KeyNotion } from '$quiz/question/domain/KeyNotion.valueObject';

const gradeSchema = z.object({
	skillsMastered: z.array(z.string()),
	skillsToReinforce: z.array(z.string()),
	comment: z.string().optional()
});

export class OpenRouterGradingService implements IGradingService {
	private readonly openrouter: OpenRouterProvider;
	private readonly modelName: string;

	constructor(config: { apiKey: string; modelName?: string }) {
		if (!config.apiKey) {
			throw new Error('OPENROUTER_API_KEY is not defined');
		}
		this.openrouter = createOpenRouter({
			baseURL: 'https://openrouter.ai/api/v1',
			apiKey: config.apiKey
		});
		this.modelName = config.modelName || 'google/gemini-2.5-flash-preview-09-2025';
	}

	async gradeAnswer(
		questionText: string,
		answerText: string,
		keyNotions?: KeyNotion[]
	): Promise<Grade> {
		const prompt = `
You are an expert teacher grading a student's answer.
Question: "${questionText}"
Student Answer: "${answerText}"
Key Notions to look for: ${JSON.stringify(keyNotions || [])}

Please evaluate the answer and provide:
1. A list of skills or concepts the student has mastered.
2. A list of skills or concepts that need reinforcement or were missed.
3. A brief, constructive comment for the student.

Output must be valid JSON matching the schema.
`;

		try {
			const { object } = await generateObject({
				model: this.openrouter(this.modelName),
				prompt: prompt,
				schema: gradeSchema
			});

			return Grade.create({
				skillsMastered: object.skillsMastered,
				skillsToReinforce: object.skillsToReinforce,
				comment: object.comment
			});
		} catch (error) {
			console.error('Error grading answer with LLM:', error);
			throw new Error('Failed to grade answer');
		}
	}
}
