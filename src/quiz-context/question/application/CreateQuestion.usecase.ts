import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { Question } from '$quiz/question/domain/Question.entity';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import z from 'zod';
import { NotFoundError } from '$quiz/application/errors/NotFoundError';
import type { ITeacherRepository } from '$quiz/teacher/domain/interfaces/ITeacherRepository';
import { KeyNotion } from '$quiz/question/domain/KeyNotion.valueObject';

export const CreateQuestionCommandSchema = z.object({
	authorId: z.instanceof(TeacherId),
	text: z.string().min(1),
	keyNotions: z
		.object({
			text: z.string().min(1),
			description: z.string().optional(),
			weight: z.number().optional(),
			synonyms: z.array(z.string()).optional()
		})
		.array()
		.optional()
});
export type CreateQuestionCommand = z.infer<typeof CreateQuestionCommandSchema>;

export class CreateQuestionUsecase {
	constructor(
		private readonly questionRepository: IQuestionRepository,
		private readonly teacherRepository: ITeacherRepository
	) {}

	execute = async ({ authorId, text, keyNotions }: CreateQuestionCommand) => {
		const teacher = await this.teacherRepository.findById(authorId);
		if (!teacher) {
			throw new NotFoundError(`Author with id ${authorId.id()} not found`);
		}
		const question = Question.create({
			authorId,
			text,
			keyNotions: keyNotions?.map((it) => new KeyNotion({ ...it }))
		});
		await this.questionRepository.save(question);
		return question;
	};
}
