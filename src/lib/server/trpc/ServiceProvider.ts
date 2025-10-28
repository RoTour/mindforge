import { PrismaPromotionRepository } from '$quiz/infra/PromotionRepository/PrismaPromotionRepository';
import { ImageStudentListParser } from '$quiz/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/infra/StudentRepository/PrismaStudentRepository';
import { prisma } from '../prisma/prisma';

export const ServiceProvider = {
	PromotionRepository: new PrismaPromotionRepository(prisma),
	StudentRepository: new PrismaStudentRepository(prisma),
	StudentListParser: new ImageStudentListParser()
};
