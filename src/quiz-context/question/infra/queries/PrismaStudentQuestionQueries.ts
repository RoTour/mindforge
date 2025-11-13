// src/quiz-context/question/infra/queries/PrismaStudentQuestionQueries.ts
import type { PrismaClient } from '$prisma/client';
import type { QuestionId } from '../../domain/QuestionId.valueObject';
import type {
	IStudentQuestionQueries,
	QuestionDetailsDTO
} from '../../application/queries/IStudentQuestionQueries';

export class PrismaStudentQuestionQueries implements IStudentQuestionQueries {
	constructor(private readonly client: PrismaClient) {}

	async getQuestionDetails(questionId: QuestionId): Promise<QuestionDetailsDTO | null> {
		const question = await this.client.question.findUnique({
			where: {
				id: questionId.id()
			},
			select: {
				id: true,
				text: true
			}
		});

		return question;
	}
}
