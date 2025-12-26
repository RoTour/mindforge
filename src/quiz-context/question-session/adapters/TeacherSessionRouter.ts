// src/quiz-context/question-session/adapters/TeacherSessionRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import { z } from 'zod';
import { AddQuestionToSessionUsecase } from '../application/AddQuestionToSessionUsecase';
import { CloseLiveSessionUsecase } from '../application/CloseLiveSessionUsecase';
import { CreateLiveSessionUsecase } from '../application/CreateLiveSessionUsecase';
import { RemoveQuestionFromSessionUsecase } from '../application/RemoveQuestionFromSessionUsecase';
import { ReorderSessionQuestionsUsecase } from '../application/ReorderSessionQuestionsUsecase';
import { StartLiveSessionUsecase } from '../application/StartLiveSessionUsecase';
import { UnlockQuestionSlotUsecase } from '../application/UnlockQuestionSlotUsecase';

export const TeacherSessionRouter = router({
	getSessions: teacherProcedure
		.input(z.object({ promotionId: z.string() }))
		.query(async ({ input }) => {
			return serviceProvider.TeacherSessionQueries.getSessionsForPromotion(input.promotionId);
		}),

	createSession: teacherProcedure
		.input(
			z.object({
				promotionId: z.string(),
				scheduledDate: z.coerce.date(),
				endsAt: z.coerce.date(),
				questionIds: z.array(z.string()).optional()
			})
		)
		.mutation(async ({ input }) => {
			const usecase = new CreateLiveSessionUsecase(serviceProvider.LiveSessionRepository);
			return usecase.execute({
				promotionId: input.promotionId,
				scheduledDate: input.scheduledDate,
				endsAt: input.endsAt,
				questionIds: input.questionIds ?? []
			});
		}),

	addQuestion: teacherProcedure
		.input(z.object({ liveSessionId: z.string(), questionId: z.string() }))
		.mutation(async ({ input }) => {
			const usecase = new AddQuestionToSessionUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({
				liveSessionId: input.liveSessionId,
				questionId: input.questionId
			});
		}),

	removeQuestion: teacherProcedure
		.input(z.object({ liveSessionId: z.string(), slotOrder: z.number() }))
		.mutation(async ({ input }) => {
			const usecase = new RemoveQuestionFromSessionUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({
				liveSessionId: input.liveSessionId,
				slotOrder: input.slotOrder
			});
		}),

	reorderQuestions: teacherProcedure
		.input(z.object({ liveSessionId: z.string(), questionOrders: z.array(z.number()) }))
		.mutation(async ({ input }) => {
			const usecase = new ReorderSessionQuestionsUsecase(serviceProvider.LiveSessionRepository);
			await usecase.execute({
				liveSessionId: input.liveSessionId,
				questionOrders: input.questionOrders
			});
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

