import { TRPCError } from '@trpc/server';
import { serviceProvider } from '$lib/server/container';
import { t } from '../init';

export const authedStudentProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { authUserId } = ctx;
	if (!authUserId) throw new TRPCError({ code: 'UNAUTHORIZED' });

	const studentId = await serviceProvider.StudentQueries.getStudentIdByAuthUserId(authUserId);
	if (!studentId) throw new TRPCError({ code: 'FORBIDDEN' });

	return next({
		ctx: {
			authUserId: authUserId as string,
			student: { id: studentId }
		}
	});
});
