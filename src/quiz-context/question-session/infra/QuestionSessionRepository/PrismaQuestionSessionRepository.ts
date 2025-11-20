// src/quiz-context/infra/QuestionSessionRepository/PrismaQuestionSessionRepository.ts
import type {
	Prisma,
	Answer as PrismaAnswer,
	PrismaClient,
	Grade as PrismaGrade,
	QuestionSession as PrismaQuestionSession
} from '$prisma/client';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { Answer } from '$quiz/question-session/domain/Answer.entity';
import { Grade } from '$quiz/question-session/domain/Grade.valueObject';
import type { IQuestionSessionRepository } from '$quiz/question-session/domain/IQuestionSessionRepository';
import {
	QuestionSession,
	type QuestionSessionStatus
} from '$quiz/question-session/domain/QuestionSession.entity';
import { QuestionSessionId } from '$quiz/question-session/domain/QuestionSessionId.valueObject';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

type PrismaQuestionSessionWithRelations = PrismaQuestionSession & {
	answers: (PrismaAnswer & { autoGrade: PrismaGrade | null; teacherGrade: PrismaGrade | null })[];
};

class QuestionSessionMapper {
	static fromPrismaToDomain(prismaSession: PrismaQuestionSessionWithRelations): QuestionSession {
		try {
			const answers = prismaSession.answers.map((a) => {
				const ans = new Answer({
					studentId: new StudentId(a.studentId),
					text: a.text,
					submittedAt: a.submittedAt,
					autoGrade: a.autoGrade
						? Grade.create({
								skillsMastered: a.autoGrade.skillsMastered,
								skillsToReinforce: a.autoGrade.skillsToReinforce,
								comment: a.autoGrade.comment ?? undefined
							})
						: undefined,
					teacherGrade: a.teacherGrade
						? Grade.create({
								skillsMastered: a.teacherGrade.skillsMastered,
								skillsToReinforce: a.teacherGrade.skillsToReinforce,
								comment: a.teacherGrade.comment ?? undefined
							})
						: undefined,
					isPublished: a.isPublished
				});
				return ans;
			});

			return QuestionSession.rehydrate({
				id: new QuestionSessionId(prismaSession.id),
				questionId: new QuestionId(prismaSession.questionId),
				promotionId: new PromotionId(prismaSession.promotionId),
				startedAt: prismaSession.startedAt,
				endsAt: prismaSession.endsAt,
				status: prismaSession.status as QuestionSessionStatus,
				answers: answers
			});
		} catch (e) {
			console.error('Error in QuestionSessionMapper', e);
			throw e;
		}
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
					student: { connect: { id: answer.studentId.id() } },
					text: answer.text,
					submittedAt: answer.submittedAt,
					isPublished: answer.isPublished,
					autoGrade: answer.autoGrade
						? {
								create: {
									skillsMastered: answer.autoGrade.skillsMastered,
									skillsToReinforce: answer.autoGrade.skillsToReinforce,
									comment: answer.autoGrade.comment
								}
							}
						: undefined,
					teacherGrade: answer.teacherGrade
						? {
								create: {
									skillsMastered: answer.teacherGrade.skillsMastered,
									skillsToReinforce: answer.teacherGrade.skillsToReinforce,
									comment: answer.teacherGrade.comment
								}
							}
						: undefined
				}))
			}
		};
	}
}

export class PrismaQuestionSessionRepository implements IQuestionSessionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(session: QuestionSession): Promise<void> {
		const prismaSession = QuestionSessionMapper.fromDomainToPrisma(session);

		const answersToUpsert = session.answers.map((answer) => {
			const gradePayload = (g: Grade) => ({
				skillsMastered: g.skillsMastered,
				skillsToReinforce: g.skillsToReinforce,
				comment: g.comment
			});

			const answerUpdatePayload = {
				text: answer.text,
				submittedAt: answer.submittedAt,
				isPublished: answer.isPublished,
				autoGrade: answer.autoGrade
					? {
							upsert: {
								create: gradePayload(answer.autoGrade),
								update: gradePayload(answer.autoGrade)
							}
						}
					: undefined,
				teacherGrade: answer.teacherGrade
					? {
							upsert: {
								create: gradePayload(answer.teacherGrade),
								update: gradePayload(answer.teacherGrade)
							}
						}
					: undefined
			};

			return {
				where: {
					questionSessionId_studentId: {
						questionSessionId: session.id.id(),
						studentId: answer.studentId.id()
					}
				},
				create: {
					student: { connect: { id: answer.studentId.id() } },
					text: answer.text,
					submittedAt: answer.submittedAt,
					isPublished: answer.isPublished,
					autoGrade: answer.autoGrade ? { create: gradePayload(answer.autoGrade) } : undefined,
					teacherGrade: answer.teacherGrade
						? { create: gradePayload(answer.teacherGrade) }
						: undefined
				},
				update: answerUpdatePayload
			};
		});

		try {
			await this.prisma.questionSession.upsert({
				where: { id: session.id.id() },
				create: prismaSession,
				update: {
					questionId: session.questionId.id(),
					promotionId: session.promotionId.id(),
					startedAt: session.startedAt,
					endsAt: session.endsAt,
					status: session.status,
					answers: {
						upsert: answersToUpsert
					}
				}
			});
		} catch (e) {
			console.error('Error in PrismaQuestionSessionRepository.save', e);
			throw e;
		}
	}

	async findById(id: QuestionSessionId): Promise<QuestionSession | null> {
		const session = await this.prisma.questionSession.findUnique({
			where: { id: id.id() },
			include: {
				answers: {
					include: {
						autoGrade: true,
						teacherGrade: true
					}
				}
			}
		});
		if (!session) return null;

		return QuestionSessionMapper.fromPrismaToDomain(session);
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<QuestionSession[]> {
		const prismaSessions = await this.prisma.questionSession.findMany({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE'
			},
			include: {
				answers: {
					include: {
						autoGrade: true,
						teacherGrade: true
					}
				}
			}
		});

		return prismaSessions.map(QuestionSessionMapper.fromPrismaToDomain);
	}

	async findActiveByPromotionIdForStudent(
		promotionId: PromotionId,
		studentId: StudentId
	): Promise<QuestionSession[]> {
		const prismaSessions = await this.prisma.questionSession.findMany({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE',
				NOT: {
					answers: {
						some: {
							studentId: studentId.id()
						}
					}
				}
			},
			include: {
				answers: {
					include: {
						autoGrade: true,
						teacherGrade: true
					}
				}
			}
		});

		return prismaSessions.map(QuestionSessionMapper.fromPrismaToDomain);
	}
}
