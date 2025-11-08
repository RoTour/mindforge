import type { PrismaClient } from '$prisma/client';
import type { ITeacherQueries } from '../../application/interfaces/ITeacherQueries';
import { TeacherId } from '../../domain/TeacherId.valueObject';

export class PrismaTeacherQueries implements ITeacherQueries {
	constructor(private readonly prisma: PrismaClient) {}

	findByAuthUserId: (authUserId: string) => Promise<{ id: TeacherId } | null> = async (
		authUserId: string
	) => {
		const teacher = await this.prisma.teacher.findUnique({
			where: {
				authUserId: authUserId
			},
			select: {
				id: true
			}
		});

		if (!teacher) {
			return null;
		}

		return { id: new TeacherId(teacher.id) };
	};
}
