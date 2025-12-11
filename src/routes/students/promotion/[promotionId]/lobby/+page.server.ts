// src/routes/students/promotion/[promotionId]/lobby/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { parent } = event;
	const { lobbyData } = await parent();
	const { promotionId } = event.params;

	// If there's a current slot that student hasn't answered - redirect to answer it
	if (lobbyData?.currentSlot && !lobbyData.currentSlot.answered) {
		throw redirect(
			303,
			`/students/promotion/${promotionId}/question/${lobbyData.currentSlot.questionId}`
		);
	}

	// Otherwise, stay in lobby with the lobby view data
	return {
		promotionId,
		lobbyData
	};
};

