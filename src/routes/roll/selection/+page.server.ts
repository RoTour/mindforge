import { serialize } from '$lib/lib/utils';
import { ServiceProvider } from '$lib/server/ServiceProvider';
import { PromotionStudentsQueries } from '$quiz/application/queries/PromotionStudentsQueries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const students = await new PromotionStudentsQueries(
		ServiceProvider.PromotionStudentsQueries
	).getStudentsFromPromotion(`Promotion-afe16a7c-8ac6-4ca3-9a12-ee9a8fbf6b8c`);

	console.log('students', serialize(students));
	return {
		students: serialize(students)
	};
};
