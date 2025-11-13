import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async (event) => {
	const { promotions } = await event.parent();
	if (!promotions || promotions.length === 0) {
		throw redirect(303, resolve('/teacher/promotions/create'));
	}

	const firstPromotionId = promotions[0].id;
	throw redirect(303, resolve(`/teacher/promotions/${firstPromotionId}/students`));
};
