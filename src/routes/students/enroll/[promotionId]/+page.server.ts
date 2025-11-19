import { resolve } from '$app/paths';
import { serviceProvider } from '$lib/server/container';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const promotionId = params.promotionId;
	const promotion = await serviceProvider.EnrollQueries.getPromotionDetails(
		new PromotionId(promotionId)
	);

	if (!locals.authUserId) {
		const next = resolve('/students/enroll/[promotionId]', { promotionId });
		throw redirect(303, resolve('/auth/sign-in') + `?next=${encodeURIComponent(next)}`);
	}

	if (locals.userEmail && locals.authUserId) {
		const checkAndLinkUsecase = serviceProvider.CheckAndLinkStudentByEmailUsecase;
		const result = await checkAndLinkUsecase.execute(locals.userEmail, locals.authUserId);

		if (result.status === 'LINKED' || result.status === 'ALREADY_LINKED') {
			throw redirect(303, resolve('/students/promotion/[promotionId]/lobby', { promotionId }));
		}
	}

	return {
		promotion,
		authUserId: locals.authUserId
	};
};
