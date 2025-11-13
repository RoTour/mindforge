import { TRPCError } from '@trpc/server';
import { t } from '../init';

export const authedAnyUserProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { authUserId } = ctx;
	if (!authUserId) throw new TRPCError({ code: 'UNAUTHORIZED' });

	return next({
		ctx: {
			authUserId: authUserId as string
		}
	});
});
