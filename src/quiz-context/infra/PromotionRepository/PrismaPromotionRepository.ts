import type { Prisma, Promotion as PrismaPromotion } from '$prisma/client';
import { Period } from '$quiz/domain/Period.valueObject';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import { Promotion } from '$quiz/domain/Promotion.entity';
import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import { StudentId } from '$quiz/domain/StudentId.valueObject';

type PrismaPromotionWithStudents = PrismaPromotion & {
	students: { studentId: string }[];
};

class PromotionMapper {
	static fromPrismaToDomain(prismaPromotion: PrismaPromotionWithStudents): Promotion {
		const promotion = Promotion.rehydrate({
			id: new PromotionId(prismaPromotion.id),
			name: prismaPromotion.name,
			period: new Period(prismaPromotion.baseYear),
			studentIds: prismaPromotion.students.map((s) => new StudentId(s.studentId))
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
			students: {
				create: domainPromotion.studentIds.map((studentId) => ({
					student: {
						connect: {
							id: studentId.id()
						}
					}
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
				}
			}
		});

		if (!prismaPromotion) {
			return null;
		}

		return PromotionMapper.fromPrismaToDomain(prismaPromotion as PrismaPromotionWithStudents);
	}

	async findAll(): Promise<Promotion[]> {
		const prismaPromotions = await this.prisma.promotion.findMany({
			include: {
				students: {
					select: {
						studentId: true
					}
				}
			}
		});
		return prismaPromotions.map((p) =>
			PromotionMapper.fromPrismaToDomain(p as PrismaPromotionWithStudents)
		);
	}
}
