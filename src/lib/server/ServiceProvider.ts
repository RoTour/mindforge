import type { IEnrollQueries } from '$quiz/application/interfaces/IEnrollQueries';
import type { IPromotionStudentsQueries } from '$quiz/application/interfaces/IPromotionStudentsQueries';
import type { IStudentsOverviewQueries } from '$quiz/application/interfaces/IStudentsOverviewQueries';
import type { ITeacherPromotionsQueries } from '$quiz/application/interfaces/ITeacherPromotionsQueries';
import type { ITeacherQueries } from '$quiz/application/interfaces/ITeacherQueries';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import type { IQuestionRepository } from '$quiz/domain/interfaces/IQuestionRepository';
import type { IStudentListParser } from '$quiz/domain/interfaces/IStudentParser';
import type { IStudentRepository } from '$quiz/domain/interfaces/IStudentRepository';
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';
import { PrismaPromotionRepository } from '$quiz/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaEnrollQueries } from '$quiz/infra/queries/PrismaEnrollQueries';
import { PrismaPromotionStudentsQueries } from '$quiz/infra/queries/PrismaPromotionStudentsQueries';
import { PrismaStudentsOverviewQueries } from '$quiz/infra/queries/PrismaStudentsOverviewQueries';
import { PrismaTeacherPromotionsQueries } from '$quiz/infra/queries/PrismaTeacherPromotionsQueries';
import { PrismaTeacherQueries } from '$quiz/infra/queries/PrismaTeacherQueries';
import { PrismaQuestionRepository } from '$quiz/infra/QuestionRepository/PrismaQuestionRepository';
import { ImageStudentListParser } from '$quiz/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/infra/StudentRepository/PrismaStudentRepository';
import { PrismaTeacherRepository } from '$quiz/infra/TeacherRepository/PrismaTeacherRepository';
import { prisma } from './prisma/prisma';

export const ServiceProvider: ServiceProvider = {
	PromotionRepository: new PrismaPromotionRepository(prisma),
	StudentRepository: new PrismaStudentRepository(prisma),
	TeacherRepository: new PrismaTeacherRepository(prisma),
	QuestionRepository: new PrismaQuestionRepository(prisma),
	StudentListParser: new ImageStudentListParser(),
	PromotionStudentsQueries: new PrismaPromotionStudentsQueries(prisma),
	EnrollQueries: new PrismaEnrollQueries(prisma),
	TeacherQueries: new PrismaTeacherQueries(prisma),
	TeacherPromotionsQueries: new PrismaTeacherPromotionsQueries(prisma),
	StudentsOverviewQueries: new PrismaStudentsOverviewQueries(prisma)
};

export type ServiceProvider = {
	PromotionRepository: IPromotionRepository;
	StudentRepository: IStudentRepository;
	TeacherRepository: ITeacherRepository;
	StudentListParser: IStudentListParser;
	QuestionRepository: IQuestionRepository;
	PromotionStudentsQueries: IPromotionStudentsQueries;
	EnrollQueries: IEnrollQueries;
	TeacherQueries: ITeacherQueries;
	TeacherPromotionsQueries: ITeacherPromotionsQueries;
	StudentsOverviewQueries: IStudentsOverviewQueries;
};
