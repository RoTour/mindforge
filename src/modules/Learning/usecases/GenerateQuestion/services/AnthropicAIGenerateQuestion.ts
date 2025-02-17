import { env } from '$env/dynamic/private';
import { createAnthropic } from '@ai-sdk/anthropic';
import {
	CreateQuestionDtoSchema,
	QuestionAnswerSeparator,
	QuestionType,
	type CreateQuestionDto
} from '@modules/Learning/entities/Question';
import { generateObject } from 'ai';
import type { IAIGenerateQuestionService } from './IAIGenerateQuestionService';
import { z } from 'zod';

const GenerationSchema = z.object({
	questions: z
		.object({
			prompt: z.string(),
			options: z
				.object({
					text: z.string(),
					correct: z.boolean()
				})
				.array(),
			type: QuestionType
		})
		.array()
});
type Generation = z.infer<typeof GenerationSchema>;

const convertToDto = (object: Generation["questions"][number]): CreateQuestionDto => {
	return {
		prompt: object.prompt,
		type: object.type,
		options: object.options.map((it) => it.text),
		answer: object.options
			.filter((it) => it.correct)
			.map((it) => it.text)
			.join(QuestionAnswerSeparator)
	};
};

export const AnthropicAIGenerateQuestionService = (): IAIGenerateQuestionService => {
	const anthropic = createAnthropic({
		apiKey: env.ANTHROPIC_API_KEY ?? 'No API key set'
	});

	return {
		generateQuestions: async (topic: string) => {
			const { object } = await generateObject({
				model: anthropic('claude-3-5-haiku-20241022'),
				schema: GenerationSchema,
				prompt: topic,
				system:
					'Create several quiz questions with options for multiple choices. Create a prompt, and a list of options where each option is an object with the text and a property called correct which is a boolean. Keep options short. Write every prompt and options in french. The prompt should be given the following topic :'
			});
			console.debug('Object:', object);
			const result = CreateQuestionDtoSchema.array().parse(object.questions.map(convertToDto));
			return result;
		}
	};
};
