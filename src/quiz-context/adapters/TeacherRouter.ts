import { ServiceProvider } from '$lib/server/ServiceProvider';
import { router } from '$lib/server/trpc/init';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';

export const TeacherRouter = router({
	listTeacherPromotions: teacherProcedure.query(async ({ ctx }) => {
		return ServiceProvider.TeacherPromotionsQueries.listTeacherPromotions(ctx.teacher.id);
	})
});
