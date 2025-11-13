// src/lib/server/trpc/procedures/studentProcedure.ts
import { TRPCError } from '@trpc/server';
import { serviceProvider } from '$lib/server/container';
import { t } from '../init';
import { z } from 'zod';

export const studentProcedure = t.procedure
	.input(z.object({ promotionId: z.string() }))
	.use(async ({ ctx, next, input }) => {
		const { authUserId } = ctx;
		if (!authUserId) throw new TRPCError({ code: 'UNAUTHORIZED' });

		const { promotionId } = input;

		const isEnrolled = await serviceProvider.StudentQueries.isStudentInPromotion(
			authUserId,
			promotionId
		);
		if (!isEnrolled) throw new TRPCError({ code: 'FORBIDDEN' });

		const studentId = await serviceProvider.StudentQueries.getStudentIdByAuthUserId(authUserId);

		return next({
			ctx: {
				...ctx,
				authUserId: authUserId as string,
				student: { id: studentId! }, // studentId should not be null if isEnrolled is true
				promotionId
			}
		});
	});
