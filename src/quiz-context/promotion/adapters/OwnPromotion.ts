import { serviceProvider } from '$lib/server/container';
import { t } from '$lib/server/trpc/init';
import { TRPCError } from '@trpc/server';
import z from 'zod';
import { PromotionId } from '../domain/PromotionId.valueObject';

const OwnPromotionInput = z.object({
	promotionId: z
		.string()
		.or(z.instanceof(PromotionId))
		.transform((val) => {
			return val instanceof PromotionId ? val : new PromotionId(val);
		})
});

export const OwnPromotionMiddleware = t.middleware(async (opts) => {
	const { teacher } = opts.ctx;
	const input = OwnPromotionInput.safeParse(opts.input);
	if (!input.success) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid input for OwnPromotionMiddleware'
		});
	}
	if (!teacher) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	const teacherPromotions = await serviceProvider.PromotionRepository.findByOwnerId(
		teacher.id.id()
	);

	const queryPromotionInTeacherPromotions = teacherPromotions.find((p) =>
		p.id.equals(input.data.promotionId)
	);
	if (!queryPromotionInTeacherPromotions) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not own this promotion' });
	}

	return opts.next();
});
