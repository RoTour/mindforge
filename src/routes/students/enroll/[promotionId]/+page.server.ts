import { ServiceProvider } from '$lib/server/trpc/ServiceProvider';
import { EnrollQueries } from '$quiz/application/queries/EnrollQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const promotionId = params.promotionId;
	const promotion = await new EnrollQueries(ServiceProvider.EnrollQueries).getPromotionDetails(
		promotionId
	);

	return {
		promotion
	};
};
