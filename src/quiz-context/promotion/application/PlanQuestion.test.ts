// /Users/rotour/projects/mindforge/src/quiz-context/promotion/application/PlanQuestion.test.ts
import { InMemoryQuestionRepository } from '$quiz/question/infra/repositories/InMemoryQuestionRepository';
import { InMemoryTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/InMemoryTeacherRepository';
import { InMemoryPromotionRepository } from '../infra/PromotionRepository/InMemoryPromotionRepository';
import { runPlanQuestionTests } from './PlanQuestion.shared';

// Run the shared test suite with the InMemory (unit test) configuration.
runPlanQuestionTests('Unit: PlanQuestionUsecase', {
	setup: async () => {
		// For unit tests, we provide the in-memory implementations.
		return {
			promotionRepository: new InMemoryPromotionRepository(),
			questionRepository: new InMemoryQuestionRepository(),
			teacherRepository: new InMemoryTeacherRepository()
		};
	}
});
