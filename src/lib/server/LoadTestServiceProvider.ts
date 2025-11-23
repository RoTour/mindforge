import { GenerateAndSendOtpUsecase } from '$auth/otp/application/GenerateAndSendOtp.usecase';
import { VerifyOtpUsecase } from '$auth/otp/application/VerifyOtp.usecase';
import { PrismaOTPRepository } from '$auth/otp/infra/OTPRepository/PrismaOTPRepository';
import { ScheduleSessionOnPromotionQuestionPlanned } from '$quiz/promotion/application/listeners/ScheduleSessionOnPromotionQUestionPlanned.listener';
import { PrismaPromotionRepository } from '$quiz/promotion/infra/PromotionRepository/PrismaPromotionRepository';
import { PrismaTeacherPromotionsQueries } from '$quiz/promotion/infra/queries/PrismaTeacherPromotionsQueries';
import { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import type { IGradingService } from '$quiz/question-session/domain/IGradingService';
import { MockGradingService } from '$quiz/question-session/infra/MockGradingService';
import { PrismaTeacherAnswersQueries } from '$quiz/question-session/infra/queries/PrismaTeacherAnswersQueries';
import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { PrismaStudentQuestionQueries } from '$quiz/question/infra/queries/PrismaStudentQuestionQueries';
import { PrismaTeacherQuestionsQueries } from '$quiz/question/infra/queries/PrismaTeacherQuestionsQueries';
import { PrismaQuestionRepository } from '$quiz/question/infra/repositories/PrismaQuestionRepository';
import { CheckAndLinkStudentByEmailUsecase } from '$quiz/student/application/CheckAndLinkStudentByEmail.usecase';
import { ResendEmailService } from '$quiz/student/application/services/ResendEmailService';
import { AuthContextACL } from '$quiz/student/infra/auth/AuthContextACL';
import { PrismaEnrollQueries } from '$quiz/student/infra/queries/PrismaEnrollQueries';
import { PrismaPromotionStudentsQueries } from '$quiz/student/infra/queries/PrismaPromotionStudentsQueries';
import { PrismaStudentDashboardQueries } from '$quiz/student/infra/queries/PrismaStudentDashboardQueries';
import { PrismaStudentHistoryQueries } from '$quiz/student/infra/queries/PrismaStudentHistoryQueries';
import { PrismaStudentQueries } from '$quiz/student/infra/queries/PrismaStudentQueries';
import { PrismaStudentsOverviewQueries } from '$quiz/student/infra/queries/PrismaStudentsOverviewQueries';
import { PrismaUnlinkedStudentsQueries } from '$quiz/student/infra/queries/PrismaUnlinkedStudentsQueries';
import { ImageStudentListParser } from '$quiz/student/infra/StudentListParser/ImageStudentListParser';
import { PrismaStudentRepository } from '$quiz/student/infra/StudentRepository/PrismaStudentRepository';
import { PrismaTeacherQueries } from '$quiz/teacher/infra/queries/PrismaTeacherQueries';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import { BullMQAdapter } from './bullmq/BullMQ.adapter';
import type { IEnvironment } from './IEnvironment';
import { createPrismaClient } from './prisma/prisma';
import { createRedisConnection } from './redis';
import { createResendClient } from './resend/resend';
import type { ServiceProvider } from './ServiceProvider';

export class LoadTestServiceProviderFactory {
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

		const imageStudentListParser = new ImageStudentListParser({
			apiKey: 'mock-key',
			modelName: 'mock-model'
		});

		const mockGradingService: IGradingService = new MockGradingService();

		const resend = createResendClient('mock-key');
		const emailService = new ResendEmailService(resend, 'mock@test.com');
		const otpRepository = new PrismaOTPRepository(prisma);

		return {
			PromotionRepository: new PrismaPromotionRepository(prisma),
			StudentRepository: new PrismaStudentRepository(prisma),
			TeacherRepository: new PrismaTeacherRepository(prisma),
			QuestionRepository: new PrismaQuestionRepository(prisma),
			QuestionSessionRepository: questionSessionRepository,
			StudentListParser: imageStudentListParser,
			PromotionStudentsQueries: new PrismaPromotionStudentsQueries(prisma),
			EnrollQueries: new PrismaEnrollQueries(prisma),
			TeacherQueries: new PrismaTeacherQueries(prisma),
			TeacherPromotionsQueries: new PrismaTeacherPromotionsQueries(prisma),
			StudentsOverviewQueries: new PrismaStudentsOverviewQueries(prisma),
			TeacherQuestionsQueries: new PrismaTeacherQuestionsQueries(prisma),
			StudentHistoryQueries: new PrismaStudentHistoryQueries(prisma),
			StudentQueries: new PrismaStudentQueries(prisma),
			StudentQuestionQueries: new PrismaStudentQuestionQueries(prisma),
			TeacherAnswersQueries: new PrismaTeacherAnswersQueries(prisma),
			StudentDashboardQueries: new PrismaStudentDashboardQueries(prisma),
			UnlinkedStudentsQueries: new PrismaUnlinkedStudentsQueries(prisma),
			CheckAndLinkStudentByEmailUsecase: new CheckAndLinkStudentByEmailUsecase(
				new PrismaStudentRepository(prisma)
			),
			MessageQueue: mq,
			eventListeners: {
				scheduleSessionOnPromotionQuestionPlanned: new ScheduleSessionOnPromotionQuestionPlanned(
					mq,
					new CreateQuestionSessionUsecase(questionSessionRepository)
				)
			},
			clients: {
				prisma
			},
			services: {
				ImageStudentListParser: imageStudentListParser,
				GradingService: mockGradingService,
				EmailService: emailService,
				StudentVerificationService: new AuthContextACL(
					new GenerateAndSendOtpUsecase(
						otpRepository,
						emailService
					),
					new VerifyOtpUsecase(otpRepository)
				)
			}
		};
	}
}
