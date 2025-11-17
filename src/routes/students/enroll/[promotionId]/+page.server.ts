import { serviceProvider } from '$lib/server/container';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const promotionId = params.promotionId;
	const promotion = await serviceProvider.EnrollQueries.getPromotionDetails(
		new PromotionId(promotionId)
	);

	return {
		promotion
	};
};

export const actions: Actions = {
	sendVerificationCode: async ({ request, params }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const promotionId = params.promotionId;
	}
};
