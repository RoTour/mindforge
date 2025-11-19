// src/quiz-context/student/infra/queries/PrismaUnlinkedStudentsQueries.ts
import type { PrismaClient } from '$prisma/client';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type {
	IUnlinkedStudentsQueries,
	UnlinkedStudentDTO
} from '$quiz/student/application/interfaces/IUnlinkedStudentsQueries';

export class PrismaUnlinkedStudentsQueries implements IUnlinkedStudentsQueries {
	constructor(private readonly client: PrismaClient) {}

	async getUnlinkedStudents(promotionId: PromotionId): Promise<UnlinkedStudentDTO[]> {
		const students = await this.client.student.findMany({
			where: {
				authUserId: null,
				promotions: {
					some: {
						promotionId: promotionId.id()
					}
				}
			},
			select: {
				id: true,
				name: true,
				lastName: true
			}
		});

		return students;
	}
}
