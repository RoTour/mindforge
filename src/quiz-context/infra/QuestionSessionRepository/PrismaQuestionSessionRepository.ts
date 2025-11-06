// src/quiz-context/infra/QuestionSessionRepository/PrismaQuestionSessionRepository.ts
import type {
	Answer as PrismaAnswer,
	QuestionSession as PrismaQuestionSession,
	Prisma,
	PrismaClient
} from '$prisma/client';
import { Answer } from '$quiz/domain/Answer.entity';
import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import { QuestionId } from '$quiz/domain/QuestionId.valueObject';
import { QuestionSession, type QuestionSessionStatus } from '$quiz/domain/QuestionSession.entity';
import { QuestionSessionId } from '$quiz/domain/QuestionSessionId.valueObject';
import type { IQuestionSessionRepository } from '$quiz/domain/interfaces/IQuestionSessionRepository';
import { StudentId } from '$quiz/domain/StudentId.valueObject';

type PrismaQuestionSessionWithRelations = PrismaQuestionSession & { answers: PrismaAnswer[] };

class QuestionSessionMapper {
	static fromPrismaToDomain(prismaSession: PrismaQuestionSessionWithRelations): QuestionSession {
		return QuestionSession.rehydrate({
			id: new QuestionSessionId(prismaSession.id),
			questionId: new QuestionId(prismaSession.questionId),
			promotionId: new PromotionId(prismaSession.promotionId),
			startedAt: prismaSession.startedAt,
			endsAt: prismaSession.endsAt,
			status: prismaSession.status as QuestionSessionStatus,
			answers: prismaSession.answers.map(
				(a) =>
					new Answer({
						studentId: new StudentId(a.studentId),
						text: a.text,
						submittedAt: a.submittedAt,
						grade: a.grade ?? undefined,
						assessment: a.assessment ?? undefined
					})
			)
		});
	}

	static fromDomainToPrisma(session: QuestionSession): Prisma.QuestionSessionUncheckedCreateInput {
		return {
			id: session.id.id(),
			questionId: session.questionId.id(),
			promotionId: session.promotionId.id(),
			startedAt: session.startedAt,
			endsAt: session.endsAt,
			status: session.status,
			answers: {
				create: session.answers.map((answer) => ({
					studentId: answer.studentId.id(),
					text: answer.text,
					submittedAt: answer.submittedAt,
					grade: answer.grade,
					assessment: answer.assessment
				}))
			}
		};
	}
}

export class PrismaQuestionSessionRepository implements IQuestionSessionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(session: QuestionSession): Promise<void> {
		const prismaSession = QuestionSessionMapper.fromDomainToPrisma(session);

		await this.prisma.questionSession.upsert({
			where: { id: session.id.id() },
			create: prismaSession,
			update: {
				...prismaSession,
				answers: {
					deleteMany: {},
					create: prismaSession.answers?.create
				}
			}
		});
	}

	async findById(id: QuestionSessionId): Promise<QuestionSession | null> {
		const prismaSession = await this.prisma.questionSession.findUnique({
			where: { id: id.id() },
			include: { answers: true }
		});

		if (!prismaSession) return null;

		return QuestionSessionMapper.fromPrismaToDomain(prismaSession);
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession | null> {
		const prismaSession = await this.prisma.questionSession.findFirst({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE'
			},
			include: { answers: true }
		});

		if (!prismaSession) return null;

		return QuestionSessionMapper.fromPrismaToDomain(prismaSession);
	}
}
