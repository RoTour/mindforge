import type { IEnrollQueries } from '$quiz/application/interfaces/IEnrollQueries';
import type { IPromotionStudentsQueries } from '$quiz/application/interfaces/IPromotionStudentsQueries';
import type { ITeacherQueries } from '$quiz/application/interfaces/ITeacherQueries';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import type { IStudentListParser } from '$quiz/domain/interfaces/IStudentParser';
import type { IStudentRepository } from '$quiz/domain/interfaces/IStudentRepository';
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';
import { PrismaPromotionRepository } from '$quiz/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaEnrollQueries } from '$quiz/infra/queries/PrismaEnrollQueries';
import { PrismaPromotionStudentsQueries } from '$quiz/infra/queries/PrismaPromotionStudentsQueries';
import { PrismaTeacherQueries } from '$quiz/infra/queries/PrismaTeacherQueries';
import { ImageStudentListParser } from '$quiz/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/infra/StudentRepository/PrismaStudentRepository';
import { PrismaTeacherRepository } from '$quiz/infra/TeacherRepository/PrismaTeacherRepository';
import { prisma } from './prisma/prisma';

export const ServiceProvider: ServiceProvider = {
	PromotionRepository: new PrismaPromotionRepository(prisma),
	StudentRepository: new PrismaStudentRepository(prisma),
	TeacherRepository: new PrismaTeacherRepository(prisma),
	StudentListParser: new ImageStudentListParser(),
	PromotionStudentsQueries: new PrismaPromotionStudentsQueries(prisma),
	EnrollQueries: new PrismaEnrollQueries(prisma),
	TeacherQueries: new PrismaTeacherQueries(prisma)
};

export type ServiceProvider = {
	PromotionRepository: IPromotionRepository;
	StudentRepository: IStudentRepository;
	TeacherRepository: ITeacherRepository;
	StudentListParser: IStudentListParser;
	PromotionStudentsQueries: IPromotionStudentsQueries;
	EnrollQueries: IEnrollQueries;
	TeacherQueries: ITeacherQueries;
};
