// @path: /Users/rotour/projects/mindforge/src/lib/server/ServiceProvider.ts
import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import type { ITeacherPromotionsQueries } from '$quiz/promotion/application/interfaces/ITeacherPromotionsQueries';
import { ScheduleSessionOnPromotionQuestionPlanned } from '$quiz/promotion/application/listeners/ScheduleSessionOnPromotionQUestionPlanned.listener';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { PrismaPromotionRepository } from '$quiz/promotion/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaTeacherPromotionsQueries } from '$quiz/promotion/infra/queries/PrismaTeacherPromotionsQueries';
import { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import type { IQuestionSessionRepository } from '$quiz/question-session/domain/IQuestionSessionRepository';
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
import { createPrismaClient } from './prisma/prisma';
import { createRedisConnection } from './redis';
import type { IEnvironment } from './IEnvironment';
import type { PrismaClient } from '$prisma/client';

export class ServiceProviderFactory {
	private readonly env: IEnvironment;

	constructor(env: IEnvironment) {
		this.env = env;
	}

	public create(): ServiceProvider {
		const prisma = createPrismaClient(this.env.DATABASE_URL);
		const redisConnection = createRedisConnection({
			host: this.env.REDIS_HOST,
			port: parseInt(this.env.REDIS_PORT, 10)
		});

		const mq = new BullMQAdapter(redisConnection);
		const questionSessionRepository = new PrismaQuestionSessionRepository(prisma);

		return {
			PromotionRepository: new PrismaPromotionRepository(prisma),
			StudentRepository: new PrismaStudentRepository(prisma),
			TeacherRepository: new PrismaTeacherRepository(prisma),
			QuestionRepository: new PrismaQuestionRepository(prisma),
			QuestionSessionRepository: questionSessionRepository,
			StudentListParser: new ImageStudentListParser({
				apiKey: this.env.OPENROUTER_API_KEY,
				modelName: this.env.OPENROUTER_MODEL_NAME
			}),
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
					new CreateQuestionSessionUsecase(questionSessionRepository)
				)
			},
			clients: {
				prisma
			}
		};
	}
}

export type ServiceProvider = {
	PromotionRepository: IPromotionRepository;
	StudentRepository: IStudentRepository;
	TeacherRepository: ITeacherRepository;
	QuestionRepository: IQuestionRepository;
	QuestionSessionRepository: IQuestionSessionRepository;
	StudentListParser: IStudentListParser;
	PromotionStudentsQueries: IPromotionStudentsQueries;
	EnrollQueries: IEnrollQueries;
	TeacherQueries: ITeacherQueries;
	TeacherPromotionsQueries: ITeacherPromotionsQueries;
	StudentsOverviewQueries: IStudentsOverviewQueries;
	TeacherQuestionsQueries: ITeacherQuestionsQueries;
	MessageQueue: IMessageQueue;
	eventListeners: Record<string, IDomainEventListener>;
	clients: {
		prisma: PrismaClient;
	};
};
