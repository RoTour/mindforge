// src/routes/students/promotion/[promotionId]/lobby/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { parent } = event;
	const { activeSession } = await parent();
	const { promotionId } = event.params;

	if (activeSession) {
		// Redirect to the question page
		throw redirect(303, `/students/promotion/${promotionId}/question/${activeSession.questionId}`);
	}

	// No active session, stay in lobby
	return { promotionId };
};
