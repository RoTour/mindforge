// /Users/rotour/projects/mindforge/src/quiz-context/infra/TeacherRepository/PrismaTeacherRepository.ts
import type { PrismaClient, Teacher as PrismaTeacher, Promotion } from '$prisma/client';
import { Teacher } from '$quiz/domain/Teacher.entity';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';

type PrismaTeacherWithRelations = PrismaTeacher & { promotions: Promotion[] };

class TeacherMapper {
	static fromPrismaToDomain(prismaModel: PrismaTeacherWithRelations): Teacher {
		return Teacher.rehydrate({
			id: new TeacherId(prismaModel.id),
			authUserId: prismaModel.authUserId,
			promotionIds: prismaModel.promotions.map((p) => new PromotionId(p.id))
		});
	}

	static fromDomainToPrisma(domainModel: Teacher) {
		return {
			id: domainModel.id.id(),
			authUserId: domainModel.authUserId
		};
	}
}

export class PrismaTeacherRepository implements ITeacherRepository {
	constructor(private prisma: PrismaClient) {}

	async save(teacher: Teacher): Promise<void> {
		const data = TeacherMapper.fromDomainToPrisma(teacher);

		await this.prisma.teacher.upsert({
			where: { id: teacher.id.id() },
			update: { authUserId: data.authUserId },
			create: data
		});
	}

	async findById(id: TeacherId | string): Promise<Teacher | null> {
		const teacherId = typeof id === 'string' ? id : id.id();
		const teacher = await this.prisma.teacher.findUnique({
			where: { id: teacherId },
			include: { promotions: true }
		});

		if (!teacher) {
			return null;
		}

		return TeacherMapper.fromPrismaToDomain(teacher);
	}

	async findByAuthUserId(authUserId: string): Promise<Teacher | null> {
		const teacher = await this.prisma.teacher.findUnique({
			where: { authUserId },
			include: { promotions: true }
		});

		if (!teacher) {
			return null;
		}

		return TeacherMapper.fromPrismaToDomain(teacher);
	}

	async findAll(): Promise<Teacher[]> {
		const teachers = await this.prisma.teacher.findMany({ include: { promotions: true } });
		return teachers.map(TeacherMapper.fromPrismaToDomain);
	}
}
