// src/quiz-context/infra/QuestionRepository/PrismaQuestionRepository.ts
import type { Prisma, PrismaClient, Question as PrismaQuestion } from '$prisma/client';
import { Question } from '$quiz/domain/Question.entity';
import { QuestionId } from '$quiz/domain/QuestionId.valueObject';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import type { IQuestionRepository } from '$quiz/domain/interfaces/IQuestionRepository';

// Mapper
class QuestionMapper {
	static fromPrismaToDomain(prismaQuestion: PrismaQuestion): Question {
		return Question.rehydrate({
			id: new QuestionId(prismaQuestion.id),
			text: prismaQuestion.text,
			authorId: new TeacherId(prismaQuestion.authorId)
		});
	}

	static fromDomainToPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
		return {
			id: question.id.id(),
			text: question.text,
			authorId: question.authorId.id()
		};
	}
}

export class PrismaQuestionRepository implements IQuestionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(question: Question): Promise<void> {
		const prismaQuestion = QuestionMapper.fromDomainToPrisma(question);
		await this.prisma.question.upsert({
			where: { id: question.id.id() },
			create: prismaQuestion,
			update: prismaQuestion
		});
	}

	async findById(id: QuestionId): Promise<Question | null> {
		const prismaQuestion = await this.prisma.question.findUnique({
			where: { id: id.id() }
		});

		if (!prismaQuestion) {
			return null;
		}

		return QuestionMapper.fromPrismaToDomain(prismaQuestion);
	}

	async findByAuthorId(authorId: TeacherId): Promise<Question[]> {
		const prismaQuestions = await this.prisma.question.findMany({
			where: { authorId: authorId.id() }
		});

		return prismaQuestions.map(QuestionMapper.fromPrismaToDomain);
	}
}
