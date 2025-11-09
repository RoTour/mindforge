import type { PlannedQuestion, Prisma, Promotion as PrismaPromotion } from '$prisma/client';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import { PlannedQuestion as PlannedQuestionVO } from '$quiz/promotion/domain/PlannedQuestion.valueObject';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';

type PrismaPromotionFull = PrismaPromotion & {
	students: { studentId: string }[];
	plannedQuestions: PlannedQuestion[];
};

class PromotionMapper {
	static fromPrismaToDomain(prismaPromotion: PrismaPromotionFull): Promotion {
		const promotion = Promotion.rehydrate({
			id: new PromotionId(prismaPromotion.id),
			name: prismaPromotion.name,
			period: new Period(prismaPromotion.baseYear),
			studentIds: prismaPromotion.students.map((s) => new StudentId(s.studentId)),
			teacherId: new TeacherId(prismaPromotion.teacherId),
			plannedQuestions: prismaPromotion.plannedQuestions.map((pq) =>
				PlannedQuestionVO.create({
					questionId: new QuestionId(pq.questionId),
					startingOn: pq.startingOn ?? undefined,
					endingOn: pq.endingOn ?? undefined
				})
			)
		});
		return promotion;
	}

	static fromDomainToPrisma(
		domainPromotion: Promotion
	): Prisma.PromotionCreateInput & { id: string } {
		return {
			id: domainPromotion.id.id(),
			name: domainPromotion.name,
			baseYear: domainPromotion.period.baseYear,
			teacher: {
				connect: {
					id: domainPromotion.teacherId.id()
				}
			},
			students: {
				create: domainPromotion.studentIds.map((studentId) => ({
					student: {
						connect: {
							id: studentId.id()
						}
					}
				}))
			},
			plannedQuestions: {
				create: domainPromotion.plannedQuestions.map((pq) => ({
					questionId: pq.questionId.id(),
					startingOn: pq.startingOn,
					endingOn: pq.endingOn
				}))
			}
		};
	}
}

export class PrismaPromotionRepository implements IPromotionRepository {
	private prisma: Prisma.TransactionClient;

	constructor(prismaClient: Prisma.TransactionClient) {
		this.prisma = prismaClient;
	}

	async save(promotion: Promotion): Promise<void> {
		const prismaData = PromotionMapper.fromDomainToPrisma(promotion);

		await this.prisma.promotion.upsert({
			where: { id: promotion.id.id() },
			create: prismaData,
			update: {
				name: prismaData.name,
				baseYear: prismaData.baseYear,
				students: {
					deleteMany: {},
					create: prismaData.students?.create
				},
				plannedQuestions: {
					deleteMany: {},
					create: prismaData.plannedQuestions?.create
				}
			}
		});
	}

	async findById(id: string): Promise<Promotion | null> {
		const prismaPromotion = await this.prisma.promotion.findUnique({
			where: { id },
			include: {
				students: {
					select: {
						studentId: true
					}
				},
				plannedQuestions: true
			}
		});

		if (!prismaPromotion) {
			return null;
		}

		return PromotionMapper.fromPrismaToDomain(prismaPromotion as PrismaPromotionFull);
	}

	async findAll(): Promise<Promotion[]> {
		const prismaPromotions = await this.prisma.promotion.findMany({
			include: {
				students: {
					select: {
						studentId: true
					}
				},
				plannedQuestions: true
			}
		});
		return prismaPromotions.map((p) =>
			PromotionMapper.fromPrismaToDomain(p as PrismaPromotionFull)
		);
	}

	async findByOwnerId(teacherId: string): Promise<Promotion[]> {
		const prismaPromotions = await this.prisma.promotion.findMany({
			where: {
				teacherId
			},
			include: {
				students: {
					select: {
						studentId: true
					}
				},
				plannedQuestions: true
			}
		});
		return prismaPromotions.map((p) =>
			PromotionMapper.fromPrismaToDomain(p as PrismaPromotionFull)
		);
	}
}
