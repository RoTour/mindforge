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

	const systemPrompt = `Create between 5 and 10 questions with options for multiple choices.

Create a prompt, and a list of options where each option is an object with the text and a property called correct which is a boolean. Write every prompt and options in french. The options should be progressively close

Keep options short. The prompt should be given the following topic :`

	return {
		generateQuestions: async (topic: string) => {
			const { object } = await generateObject({
				model: anthropic('claude-3-5-haiku-20241022'),
				schema: GenerationSchema,
				prompt: topic,
				system: systemPrompt,
			});
			console.debug('Object:', object);
			const result = CreateQuestionDtoSchema.array().parse(object.questions.map(convertToDto));
			return result;
		}
	};
};
