import { serviceProvider } from '$lib/server/container';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const promotionId = params.promotionId;
	const promotion = await serviceProvider.EnrollQueries.getPromotionDetails(
		new PromotionId(promotionId)
	);

	return {
		promotion
	};
};
