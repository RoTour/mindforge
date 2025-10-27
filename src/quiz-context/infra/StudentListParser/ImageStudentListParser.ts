import type { IStudentListParser, StudentData } from '$quiz/domain/interfaces/IStudentParser';
import { createOpenRouter, type OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { env } from '$env/dynamic/private';
import z from 'zod';
import { generateObject, type ModelMessage } from 'ai';
import { BadRequestError } from '$quiz/application/errors/BadRequestError';

const llmResultSchema = z.object({
	studentData: z
		.object({
			name: z.string().min(1),
			lastName: z.string().min(1).optional(),
			email: z.email().optional()
		})
		.array()
});

export class ImageStudentListParser implements IStudentListParser {
	openrouter: OpenRouterProvider;
	constructor() {
		if (!env.OPENROUTER_API_KEY) {
			throw new Error('OPENROUTER_API_KEY is not defined');
		}
		this.openrouter = createOpenRouter({
			baseURL: 'https://openrouter.ai/api/v1',
			apiKey: env.OPENROUTER_API_KEY
		});
	}

	async parse(file: File): Promise<StudentData[]> {
		if (!(file instanceof File)) {
			throw new BadRequestError(
				`Input of ImageStudentListParser should be a file, got [${typeof file}]`
			);
		}
		const buffer = await file.arrayBuffer();
		const base64Image = Buffer.from(buffer).toString('base64');
		const mimeType = file.type;

		const messages: ModelMessage[] = [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `Analyze this image, which is likely a class roster or attendance sheet. Your task is to extract the information for each student.

Provide the output as a structured JSON object that conforms to the following schema:
{ "studentData": [ { "name": "...", "lastName": "...", "email": "..." } ] }

For each student you identify, please provide:
1. The student's first name (\`name\`) if no firstName is found, a name.
2. The student's last name (\`lastName\`), if you can identify it separately. If you can only find a full name, put the full name in the \`name\` field and leave \`lastName\` empty.
3. The student's email address (\`email\`), if it is present.

Pay close attention to the required JSON structure. The top-level key must be "studentData", and its value must be an array of student objects.`
					},
					{
						type: 'image',
						image: `data:${mimeType};base64,${base64Image}`
					}
				]
			}
		];

		try {
			console.info(`Sending request to AI model for structured student list OCR...`);
			const { object } = await generateObject({
				model: this.openrouter(
					env.OPENROUTER_MODEL_NAME || 'google/gemini-2.5-flash-preview-09-2025'
				),
				messages: messages,
				schema: llmResultSchema
			});
			console.info('AI model responded successfully.');
			return object.studentData;
		} catch (error) {
			console.error('An unexpected error occurred during AI OCR processing.', error);
			throw new Error('Failed to process student list image with AI.');
		}
	}
}
