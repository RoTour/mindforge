import type { Prisma, PrismaClient, Student as PrismaStudent } from '$prisma/client';
import type { IStudentRepository } from '../../domain/interfaces/IStudentRepository';
import { Student } from '../../domain/Student.entity';
import { StudentId } from '../../domain/StudentId.valueObject';

class StudentMapper {
	static fromPrismaToDomain(prismaStudent: PrismaStudent): Student {
		return Student.rehydrate({
			id: new StudentId(prismaStudent.id),
			name: prismaStudent.name,
			lastName: prismaStudent.lastName ?? undefined,
			email: prismaStudent.email ?? undefined,
			authId: prismaStudent.authUserId ?? undefined
		});
	}

	static fromDomainToPrisma(domainStudent: Student): Prisma.StudentCreateInput {
		return {
			id: domainStudent.id.id(),
			name: domainStudent.name,
			lastName: domainStudent.lastName,
			email: domainStudent.email,
			authUserId: domainStudent.authId
		};
	}
}

export class PrismaStudentRepository implements IStudentRepository {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	async save(student: Student): Promise<void> {
		const prismaData = StudentMapper.fromDomainToPrisma(student);
		await this.prisma.student.upsert({
			where: { id: student.id.id() },
			create: prismaData,
			update: prismaData
		});
	}

	async saveMany(students: Student[]): Promise<void> {
		const upsertPromises = students.map((student) => {
			const prismaData = StudentMapper.fromDomainToPrisma(student);
			return this.prisma.student.upsert({
				where: { id: student.id.id() },
				create: prismaData,
				update: prismaData
			});
		});
		await this.prisma.$transaction(upsertPromises);
	}

	async findById(id: string): Promise<Student | null> {
		const prismaStudent = await this.prisma.student.findUnique({
			where: { id }
		});
		if (!prismaStudent) return null;
		return StudentMapper.fromPrismaToDomain(prismaStudent);
	}

	async findAll(): Promise<Student[]> {
		const prismaStudents = await this.prisma.student.findMany();
		return prismaStudents.map(StudentMapper.fromPrismaToDomain);
	}

	async findStudentByEmail(email: string): Promise<Student | null> {
		const prismaStudent = await this.prisma.student.findUnique({
			where: { email }
		});
		if (!prismaStudent) return null;
		return StudentMapper.fromPrismaToDomain(prismaStudent);
	}
}
