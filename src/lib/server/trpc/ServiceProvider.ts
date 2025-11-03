import { PrismaPromotionRepository } from '$quiz/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaEnrollQueries } from '$quiz/infra/queries/PrismaEnrollQueries';
import { PrismaPromotionStudentsQueries } from '$quiz/infra/queries/PrismaPromotionStudentsQueries';
import { PrismaTeacherQueries } from '$quiz/infra/queries/PrismaTeacherQueries';
import { ImageStudentListParser } from '$quiz/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/infra/StudentRepository/PrismaStudentRepository';
import { PrismaTeacherRepository } from '$quiz/infra/TeacherRepository/PrismaTeacherRepository';
import { prisma } from '../prisma/prisma';

export const ServiceProvider = {
	PromotionRepository: new PrismaPromotionRepository(prisma),
	StudentRepository: new PrismaStudentRepository(prisma),
	TeacherRepository: new PrismaTeacherRepository(prisma),
	StudentListParser: new ImageStudentListParser(),
	PromotionStudentsQueries: new PrismaPromotionStudentsQueries(prisma),
	EnrollQueries: new PrismaEnrollQueries(prisma),
	TeacherQueries: new PrismaTeacherQueries(prisma)
};
