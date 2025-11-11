import { serialize } from '$lib/lib/utils';
import { serviceProvider } from '$lib/server/container';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const students = await serviceProvider.PromotionStudentsQueries.getStudentsFromPromotion(
		new PromotionId(`Promotion-afe16a7c-8ac6-4ca3-9a12-ee9a8fbf6b8c`)
	);

	console.log('students', serialize(students));
	return {
		students: serialize(students)
	};
};
