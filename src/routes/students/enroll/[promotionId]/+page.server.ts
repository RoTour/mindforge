import { ServiceProvider } from '$lib/server/ServiceProvider';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const promotionId = params.promotionId;
	const promotion = await ServiceProvider.EnrollQueries.getPromotionDetails(
		new PromotionId(promotionId)
	);

	return {
		promotion
	};
};
