import { publicProcedure, router } from '$lib/server/trpc/init';
import { ServiceProvider } from '$lib/server/trpc/ServiceProvider';
import {
	CreatePromotionCommandSchema,
	CreatePromotionUsecase
} from '$quiz/application/CreatePromotion.usecase';

export const QuizRouter = router({
	createPromotion: publicProcedure
		.input(CreatePromotionCommandSchema)
		.mutation(async ({ input }) => {
			const usecase = new CreatePromotionUsecase(
				ServiceProvider.PromotionRepository,
				ServiceProvider.StudentRepository
			);
			await usecase.execute(input);
		})
});

export type QuizRouter = typeof router;
