import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type {
	PlannedQuestion as PrismaPlannedQuestion,
	Prisma,
	Promotion as PrismaPromotion,
	PrismaClient
} from '$prisma/client';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { PlannedQuestion as PlannedQuestionEntity } from '$quiz/promotion/domain/PlannedQuestion.entity';
import { PlannedQuestionId } from '$quiz/promotion/domain/PlannedQuestionId.valueObject';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

type PrismaPromotionFull = PrismaPromotion & {
	students: { studentId: string }[];
	plannedQuestions: PrismaPlannedQuestion[];
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
				// Rehydrate as an entity, including its own ID
				PlannedQuestionEntity.rehydrate({
					id: new PlannedQuestionId(pq.id),
					questionId: new QuestionId(pq.questionId),
					startingOn: pq.startingOn ?? undefined,
					endingOn: pq.endingOn ?? undefined
				})
			)
		});
		return promotion;
	}

	// This mapper is now only used for the initial creation within the upsert.
	// The complex relation logic is handled directly in the `save` method's transaction.
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
			}
		};
	}
}

export class PrismaPromotionRepository implements IPromotionRepository {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async save(promotion: Promotion): Promise<void> {
		const prismaData = PromotionMapper.fromDomainToPrisma(promotion);

		// The transaction ensures all DB changes succeed or fail together.
		await this.prisma.$transaction(async (tx) => {
			// Step 1: Upsert the core Promotion aggregate fields
			await tx.promotion.upsert({
				where: { id: promotion.id.id() },
				create: prismaData,
				update: {
					name: prismaData.name,
					baseYear: prismaData.baseYear
				}
			});

			// Step 2: Synchronize the Students (simple delete and recreate)
			await tx.studentsOnPromotions.deleteMany({ where: { promotionId: promotion.id.id() } });
			await tx.studentsOnPromotions.createMany({
				data: promotion.studentIds.map((sid) => ({
					promotionId: promotion.id.id(),
					studentId: sid.id()
				}))
			});

			// Step 3: Synchronize the PlannedQuestion child entities (intelligent upsert/delete)
			const existingPlans = await tx.plannedQuestion.findMany({
				where: { promotionId: promotion.id.id() }
			});
			const domainPlans: PlannedQuestionEntity[] = promotion.plannedQuestions;

			const existingPlanIds = new Set(existingPlans.map((p) => p.id));
			const domainPlanIds = new Set(domainPlans.map((p) => p.id.id()));

			// Find plans to delete, create, and update
			const toDelete = existingPlans.filter((p) => !domainPlanIds.has(p.id));
			const toCreate = domainPlans.filter((p) => !existingPlanIds.has(p.id.id()));
			const toUpdate = domainPlans.filter((p) => existingPlanIds.has(p.id.id()));

			// Execute database operations
			if (toDelete.length > 0) {
				await tx.plannedQuestion.deleteMany({
					where: { id: { in: toDelete.map((p) => p.id) } }
				});
			}
			if (toCreate.length > 0) {
				await tx.plannedQuestion.createMany({
					data: toCreate.map((p) => ({
						id: p.id.id(),
						promotionId: promotion.id.id(),
						questionId: p.questionId.id(),
						startingOn: p.startingOn,
						endingOn: p.endingOn
					}))
				});
			}
			for (const plan of toUpdate) {
				await tx.plannedQuestion.update({
					where: { id: plan.id.id() },
					data: {
						startingOn: plan.startingOn,
						endingOn: plan.endingOn
					}
				});
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
