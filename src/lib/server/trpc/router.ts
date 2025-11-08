import { PromotionRouter } from '$quiz/promotion/adapters/PromotionRouter.js';
import { QuestionRouter } from '$quiz/question/adapters/QuestionRouter.js';
import { StudentsOverviewRouter } from '$quiz/student/adapters/StudentRouter.js';
import { TeacherRouter } from '$quiz/teacher/adapters/TeacherRouter.js';
import { router } from './init.js';

export const appRouter = router({
	promotion: PromotionRouter,
	question: QuestionRouter,
	teacher: TeacherRouter,
	student: StudentsOverviewRouter
});

export type AppRouter = typeof appRouter;
