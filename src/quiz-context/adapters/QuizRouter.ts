import { publicProcedure, router } from '$lib/server/trpc/init';
import { ServiceProvider } from '$lib/server/trpc/ServiceProvider';
import { ParseStudentListUsecase } from '$quiz/application/ParseStudentList.usecase';
import { octetInputParser } from '@trpc/server/http';

export const QuizRouter = router({
	parseStudentListFromFile: publicProcedure.input(octetInputParser).mutation(async ({ input }) => {
		const usecase = new ParseStudentListUsecase(ServiceProvider.StudentListParser);
		console.log('Input file:', input);
		const result = await usecase.execute({
			file: input
		});
		return result;
	})
});

export type QuizRouter = typeof router;
