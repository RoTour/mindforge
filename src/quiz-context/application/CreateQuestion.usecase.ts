import type { IQuestionRepository } from '$quiz/domain/interfaces/IQuestionRepository';
import { Question } from '$quiz/domain/Question.entity';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import z from 'zod';
import { NotFoundError } from './errors/NotFoundError';
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';

export const CreateQuestionCommandSchema = z.object({
	authorId: z.instanceof(TeacherId),
	text: z.string().min(1)
});
export type CreateQuestionCommand = z.infer<typeof CreateQuestionCommandSchema>;

export class CreateQuestionUsecase {
	constructor(
		private readonly questionRepository: IQuestionRepository,
		private readonly teacherRepository: ITeacherRepository
	) {}

	execute = async ({ authorId, text }: CreateQuestionCommand) => {
		const teacher = await this.teacherRepository.findById(authorId);
		if (!teacher) {
			throw new NotFoundError(`Author with id ${authorId.id()} not found`);
		}
		const question = Question.create({
			authorId,
			text
		});
		await this.questionRepository.save(question);
		return question;
	};
}
