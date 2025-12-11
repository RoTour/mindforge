// src/quiz-context/question-session/infra/LiveSessionRepository/PrismaLiveSessionRepository.ts
import type {
    Prisma,
    Answer as PrismaAnswer,
    PrismaClient,
    Grade as PrismaGrade,
    LiveSession as PrismaLiveSession,
    QuestionSlot as PrismaQuestionSlot
} from '$prisma/client';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { Answer } from '$quiz/question-session/domain/Answer.entity';
import { Grade } from '$quiz/question-session/domain/Grade.valueObject';
import type { ILiveSessionRepository } from '$quiz/question-session/domain/ILiveSessionRepository';
import {
    LiveSession,
    type LiveSessionStatus
} from '$quiz/question-session/domain/LiveSession.entity';
import { LiveSessionId } from '$quiz/question-session/domain/LiveSessionId.valueObject';
import {
    QuestionSlot,
    type QuestionSlotStatus
} from '$quiz/question-session/domain/QuestionSlot.entity';
import { QuestionSlotId } from '$quiz/question-session/domain/QuestionSlotId.valueObject';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

type PrismaAnswerWithGrades = PrismaAnswer & {
	autoGrade: PrismaGrade | null;
	teacherGrade: PrismaGrade | null;
};

type PrismaSlotWithRelations = PrismaQuestionSlot & {
	answers: PrismaAnswerWithGrades[];
};

type PrismaLiveSessionWithRelations = PrismaLiveSession & {
	slots: PrismaSlotWithRelations[];
};

class LiveSessionMapper {
	static fromPrismaToDomain(prismaSession: PrismaLiveSessionWithRelations): LiveSession {
		try {
			const slots = prismaSession.slots.map((slot) => {
				const answers = slot.answers.map((a) => {
					return new Answer({
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
				});

				return QuestionSlot.rehydrate({
					id: new QuestionSlotId(slot.id),
					questionId: new QuestionId(slot.questionId),
					order: slot.order,
					status: slot.status as QuestionSlotStatus,
					answers: answers
				});
			});

			return LiveSession.rehydrate({
				id: new LiveSessionId(prismaSession.id),
				promotionId: new PromotionId(prismaSession.promotionId),
				scheduledDate: prismaSession.scheduledDate,
				endsAt: prismaSession.endsAt,
				status: prismaSession.status as LiveSessionStatus,
				lockPreviousOnUnlock: prismaSession.lockPreviousOnUnlock,
				slots: slots
			});
		} catch (e) {
			console.error('Error in LiveSessionMapper', e);
			throw e;
		}
	}

	static fromDomainToPrisma(session: LiveSession): Prisma.LiveSessionUncheckedCreateInput {
		return {
			id: session.id.id(),
			promotionId: session.promotionId.id(),
			scheduledDate: session.scheduledDate,
			endsAt: session.endsAt,
			status: session.status,
			lockPreviousOnUnlock: session.lockPreviousOnUnlock,
			slots: {
				create: session.slots.map((slot) => ({
					id: slot.id.id(),
					questionId: slot.questionId.id(),
					order: slot.order,
					status: slot.status,
					answers: {
						create: slot.answers.map((answer) => ({
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
				}))
			}
		};
	}
}

export class PrismaLiveSessionRepository implements ILiveSessionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	private readonly includeSlots = {
		slots: {
			orderBy: { order: 'asc' as const },
			include: {
				answers: {
					include: {
						autoGrade: true,
						teacherGrade: true
					}
				}
			}
		}
	};

	async save(session: LiveSession): Promise<void> {
		const gradePayload = (g: Grade) => ({
			skillsMastered: g.skillsMastered,
			skillsToReinforce: g.skillsToReinforce,
			comment: g.comment
		});

		try {
			// Upsert the session
			await this.prisma.liveSession.upsert({
				where: { id: session.id.id() },
				create: LiveSessionMapper.fromDomainToPrisma(session),
				update: {
					promotionId: session.promotionId.id(),
					scheduledDate: session.scheduledDate,
					endsAt: session.endsAt,
					status: session.status,
					lockPreviousOnUnlock: session.lockPreviousOnUnlock
				}
			});

			// Upsert each slot
			for (const slot of session.slots) {
				await this.prisma.questionSlot.upsert({
					where: { id: slot.id.id() },
					create: {
						id: slot.id.id(),
						liveSession: { connect: { id: session.id.id() } },
						question: { connect: { id: slot.questionId.id() } },
						order: slot.order,
						status: slot.status
					},
					update: {
						status: slot.status
					}
				});

				// Upsert each answer in the slot
				for (const answer of slot.answers) {
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

					await this.prisma.answer.upsert({
						where: {
							questionSlotId_studentId: {
								questionSlotId: slot.id.id(),
								studentId: answer.studentId.id()
							}
						},
						create: {
							questionSlot: { connect: { id: slot.id.id() } },
							student: { connect: { id: answer.studentId.id() } },
							text: answer.text,
							submittedAt: answer.submittedAt,
							isPublished: answer.isPublished,
							autoGrade: answer.autoGrade
								? { create: gradePayload(answer.autoGrade) }
								: undefined,
							teacherGrade: answer.teacherGrade
								? { create: gradePayload(answer.teacherGrade) }
								: undefined
						},
						update: answerUpdatePayload
					});
				}
			}
		} catch (e) {
			console.error('Error in PrismaLiveSessionRepository.save', e);
			throw e;
		}
	}

	async saveAnswer(session: LiveSession, slotOrder: number, answer: Answer): Promise<void> {
		const slot = session.getSlotByOrder(slotOrder);
		if (!slot) {
			throw new Error(`Slot with order ${slotOrder} not found`);
		}

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

		try {
			await this.prisma.answer.upsert({
				where: {
					questionSlotId_studentId: {
						questionSlotId: slot.id.id(),
						studentId: answer.studentId.id()
					}
				},
				create: {
					questionSlot: { connect: { id: slot.id.id() } },
					student: { connect: { id: answer.studentId.id() } },
					text: answer.text,
					submittedAt: answer.submittedAt,
					isPublished: answer.isPublished,
					autoGrade: answer.autoGrade
						? { create: gradePayload(answer.autoGrade) }
						: undefined,
					teacherGrade: answer.teacherGrade
						? { create: gradePayload(answer.teacherGrade) }
						: undefined
				},
				update: answerUpdatePayload
			});
		} catch (e) {
			console.error('Error in PrismaLiveSessionRepository.saveAnswer', e);
			throw e;
		}
	}

	async findById(id: LiveSessionId): Promise<LiveSession | null> {
		const session = await this.prisma.liveSession.findUnique({
			where: { id: id.id() },
			include: this.includeSlots
		});
		if (!session) return null;

		return LiveSessionMapper.fromPrismaToDomain(session);
	}

	async findByIdForStudent(
		id: LiveSessionId,
		studentId: StudentId
	): Promise<LiveSession | null> {
		const session = await this.prisma.liveSession.findUnique({
			where: { id: id.id() },
			include: {
				slots: {
					orderBy: { order: 'asc' },
					include: {
						answers: {
							where: { studentId: studentId.id() },
							include: {
								autoGrade: true,
								teacherGrade: true
							}
						}
					}
				}
			}
		});
		if (!session) return null;

		return LiveSessionMapper.fromPrismaToDomain(session);
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<LiveSession[]> {
		const prismaSessions = await this.prisma.liveSession.findMany({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE'
			},
			include: this.includeSlots
		});

		return prismaSessions.map(LiveSessionMapper.fromPrismaToDomain);
	}

	async findActiveByPromotionIdForStudent(
		promotionId: PromotionId,
		studentId: StudentId
	): Promise<LiveSession[]> {
		// Find active sessions for this promotion that have at least one unlocked slot
		// the student hasn't answered yet
		const prismaSessions = await this.prisma.liveSession.findMany({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE',
				slots: {
					some: {
						status: 'UNLOCKED',
						NOT: {
							answers: {
								some: {
									studentId: studentId.id()
								}
							}
						}
					}
				}
			},
			include: {
				slots: {
					orderBy: { order: 'asc' },
					include: {
						answers: {
							where: { studentId: studentId.id() },
							include: {
								autoGrade: true,
								teacherGrade: true
							}
						}
					}
				}
			}
		});

		return prismaSessions.map(LiveSessionMapper.fromPrismaToDomain);
	}
}
