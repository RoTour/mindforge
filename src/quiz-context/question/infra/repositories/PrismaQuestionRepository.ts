// src/quiz-context/infra/QuestionRepository/PrismaQuestionRepository.ts
import type { Prisma, PrismaClient, Question as PrismaQuestion } from '$prisma/client';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import type { KeyNotionProps } from '$quiz/question/domain/KeyNotion.valueObject';
import { Question } from '$quiz/question/domain/Question.entity';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

// Mapper
class QuestionMapper {
	static fromPrismaToDomain(prismaQuestion: PrismaQuestion): Question {
		return Question.rehydrate({
			id: new QuestionId(prismaQuestion.id),
			text: prismaQuestion.text,
			authorId: new TeacherId(prismaQuestion.authorId),
			keyNotions: (prismaQuestion.keyNotions as KeyNotionProps[] | null) ?? []
		});
	}

	static fromDomainToPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
		return {
			id: question.id.id(),
			text: question.text,
			authorId: question.authorId.id(),
			keyNotions: question.keyNotions.map((kn) => ({
				text: kn.text,
				description: kn.description,
				weight: kn.weight,
				synonyms: kn.synonyms
			}))
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
