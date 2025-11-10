// /Users/rotour/projects/mindforge/src/quiz-context/promotion/application/PlanQuestion.test.ts
import { PrismaQuestionRepository } from '$quiz/question/infra/repositories/PrismaQuestionRepository';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import { getPrismaTestClient } from '../../../../test/setupIntegration';
import { PrismaPromotionRepository } from '../infra/PromotionRepository/PrismaPromotionRepository';
import { runPlanQuestionTests } from './PlanQuestion.shared';

// Run the shared test suite with the Prisma (unit test) configuration.
runPlanQuestionTests('Int:PlanQuestionUsecase', {
	setup: async () => {
		const prisma = getPrismaTestClient();
		return {
			promotionRepository: new PrismaPromotionRepository(prisma),
			questionRepository: new PrismaQuestionRepository(prisma),
			teacherRepository: new PrismaTeacherRepository(prisma)
		};
	}
});
