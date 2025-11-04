import { TRPCError } from '@trpc/server';
import { ServiceProvider } from '$lib/server/ServiceProvider';
import { t } from '../init';

export const teacherProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { authUserId } = ctx;
	if (!authUserId) throw new TRPCError({ code: 'UNAUTHORIZED' });

	const teacher = await ServiceProvider.TeacherQueries.findByAuthUserId(authUserId);
	if (!teacher) throw new TRPCError({ code: 'FORBIDDEN' });

	return next({
		ctx: {
			authUserId: authUserId as string,
			teacher: { id: teacher.id }
		}
	});
});
