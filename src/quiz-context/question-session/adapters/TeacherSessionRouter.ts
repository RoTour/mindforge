// src/quiz-context/question-session/adapters/TeacherSessionRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { z } from 'zod';
import { CloseLiveSessionUsecase } from '../application/CloseLiveSessionUsecase';
import { StartLiveSessionUsecase } from '../application/StartLiveSessionUsecase';
import { UnlockQuestionSlotUsecase } from '../application/UnlockQuestionSlotUsecase';

export const TeacherSessionRouter = router({
	getSessions: teacherProcedure
		.input(z.object({ promotionId: z.string() }))
		.query(async ({ input }) => {
			return serviceProvider.TeacherSessionQueries.getSessionsForPromotion(input.promotionId);
		}),

	startSession: teacherProcedure
		.input(z.object({ liveSessionId: z.string() }))
		.mutation(async ({ input }) => {
			const usecase = new StartLiveSessionUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({ liveSessionId: input.liveSessionId });
		}),

	closeSession: teacherProcedure
		.input(z.object({ liveSessionId: z.string() }))
		.mutation(async ({ input }) => {
			const usecase = new CloseLiveSessionUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({ liveSessionId: input.liveSessionId });
		}),

	unlockSlot: teacherProcedure
		.input(z.object({ liveSessionId: z.string(), slotOrder: z.number() }))
		.mutation(async ({ input }) => {
			const usecase = new UnlockQuestionSlotUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({
				liveSessionId: input.liveSessionId,
				slotOrder: input.slotOrder
			});
		})
});
