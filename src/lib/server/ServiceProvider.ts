import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import type { ITeacherPromotionsQueries } from '$quiz/promotion/application/interfaces/ITeacherPromotionsQueries';
import { ScheduleSessionOnPromotionQuestionPlanned } from '$quiz/promotion/application/listeners/ScheduleSessionOnPromotionQUestionPlanned.listener';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { PrismaPromotionRepository } from '$quiz/promotion/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaTeacherPromotionsQueries } from '$quiz/promotion/infra/queries/PrismaTeacherPromotionsQueries';
import { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import type { ITeacherQuestionsQueries } from '$quiz/question/application/interfaces/ITeacherQuestionsQueries';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { PrismaTeacherQuestionsQueries } from '$quiz/question/infra/queries/PrismaTeacherQuestionsQueries';
import { PrismaQuestionRepository } from '$quiz/question/infra/repositories/PrismaQuestionRepository';
import type { IEnrollQueries } from '$quiz/student/application/interfaces/IEnrollQueries';
import type { IPromotionStudentsQueries } from '$quiz/student/application/interfaces/IPromotionStudentsQueries';
import type { IStudentsOverviewQueries } from '$quiz/student/application/interfaces/IStudentsOverviewQueries';
import type { IStudentListParser } from '$quiz/student/domain/interfaces/IStudentParser';
import type { IStudentRepository } from '$quiz/student/domain/interfaces/IStudentRepository';
import { PrismaEnrollQueries } from '$quiz/student/infra/queries/PrismaEnrollQueries';
import { PrismaPromotionStudentsQueries } from '$quiz/student/infra/queries/PrismaPromotionStudentsQueries';
import { PrismaStudentsOverviewQueries } from '$quiz/student/infra/queries/PrismaStudentsOverviewQueries';
import { ImageStudentListParser } from '$quiz/student/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/student/infra/StudentRepository/PrismaStudentRepository';
import type { ITeacherQueries } from '$quiz/teacher/application/interfaces/ITeacherQueries';
import type { ITeacherRepository } from '$quiz/teacher/domain/interfaces/ITeacherRepository';
import { PrismaTeacherQueries } from '$quiz/teacher/infra/queries/PrismaTeacherQueries';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import { BullMQAdapter } from './bullmq/BullMQ.adapter';
import { prisma } from './prisma/prisma';
import { redisConnection } from './redis';

const mq = new BullMQAdapter(redisConnection);

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
	StudentsOverviewQueries: new PrismaStudentsOverviewQueries(prisma),
	TeacherQuestionsQueries: new PrismaTeacherQuestionsQueries(prisma),
	MessageQueue: mq,
	eventListeners: {
		scheduleSessionOnPromotionQuestionPlanned: new ScheduleSessionOnPromotionQuestionPlanned(
			mq,
			new CreateQuestionSessionUsecase(new PrismaQuestionSessionRepository(prisma))
		)
	}
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
	TeacherQuestionsQueries: ITeacherQuestionsQueries;
	MessageQueue: IMessageQueue;
	eventListeners: Record<string, IDomainEventListener>;
};
