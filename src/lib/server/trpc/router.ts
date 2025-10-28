import { router } from './init.js';
import { QuizRouter } from '$quiz/adapters/QuizRouter.js';

export const appRouter = router({
	quiz: QuizRouter
});

export type AppRouter = typeof appRouter;
