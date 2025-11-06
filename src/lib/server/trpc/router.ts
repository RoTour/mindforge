import { router } from './init.js';
import { QuizRouter } from '$quiz/adapters/QuizRouter.js';
import { QuestionRouter } from '$quiz/adapters/QuestionRouter.js';
import { StudentsOverviewRouter } from '$quiz/adapters/StudentsOverviewRouter.js';
import { TeacherRouter } from '$quiz/adapters/TeacherRouter.js';

export const appRouter = router({
	quiz: QuizRouter,
	question: QuestionRouter,
	studentsOverview: StudentsOverviewRouter,
	teacher: TeacherRouter
});

export type AppRouter = typeof appRouter;
