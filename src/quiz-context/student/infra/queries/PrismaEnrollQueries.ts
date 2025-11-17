// /Users/rotour/projects/mindforge/src/quiz-context/infra/queries/PrismaEnrollQueries.ts
import type { IEnrollQueries, PromotionDetails } from '../../application/interfaces/IEnrollQueries';
import { Prisma, type PrismaClient } from '$prisma/client';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

export class PrismaEnrollQueries implements IEnrollQueries {
	constructor(private readonly client: PrismaClient) {}

	async getPromotionDetails(promotionId: PromotionId): Promise<PromotionDetails> {
		const promotion = await this.client.promotion.findUnique({
			where: {
				id: promotionId.id()
			},
			select: {
				name: true
			}
		});

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		return promotion;
	}

	async findStudentByFullName(name: string): Promise<{ studentId: string } | null> {
		const normalizedName = name.replace(/\s+/g, '').toLowerCase();

		// Using CONCAT_WS to handle potentially null lastName gracefully.
		// REPLACE is used to make the comparison independent of spaces.
		// This is for PostgreSQL.
		const result = await this.client.$queryRaw<Array<{ id: string }>>(
			Prisma.sql`SELECT id FROM "Student" WHERE REPLACE(LOWER(CONCAT_WS(' ', name, "lastName")), ' ', '') = ${normalizedName}`
		);

		if (result.length === 0) {
			return { studentId: result[0].id };
		}

		// If 0 or more than 1 result, return null to indicate not found or ambiguous.
		return null;
	}

	async findStudentByEmail(email: string): Promise<{ studentId: string } | null> {
		const student = await this.client.student.findUnique({
			where: {
				email: email
			},
			select: {
				id: true
			}
		});

		if (!student) {
			return null;
		}

		return { studentId: student.id };
	}
}
