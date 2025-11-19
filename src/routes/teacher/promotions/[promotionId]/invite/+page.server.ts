// src/routes/teacher/promotions/[promotionId]/invite/+page.server.ts
import { serviceProvider } from '$lib/server/container';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

// Payload no longer needs promotionId
const payloadSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.email(),
	promotionId: z.string(),
	authId: z.string()
});

export const load: PageServerLoad = async ({ url, parent, params }) => {
	await parent(); // Ensures teacher is authenticated

	const { promotionId } = params;

	const payloadB64 = url.searchParams.get('payload');
	if (!payloadB64) {
		error(400, 'Missing payload');
	}

	try {
		const payloadString = Buffer.from(payloadB64, 'base64').toString('utf-8');
		const payload = JSON.parse(payloadString);
		const validation = payloadSchema.safeParse(payload);
		if (!validation.success) {
			console.warn(validation.error);
			error(400, `Invalid payload structure`);
		}

		const user = validation.data;

		const unlinkedStudents = await serviceProvider.UnlinkedStudentsQueries.getUnlinkedStudents(
			new PromotionId(promotionId)
		);

		return {
			user,
			unlinkedStudents,
			promotionId,
			email: user.email,
			authId: user.authId
		};
	} catch (e) {
		console.error(e);
		if (
			e instanceof Error &&
			(e.message.includes('Invalid payload') || e.message.includes('JSON'))
		) {
			error(400, 'Invalid payload');
		}
		error(500, 'Failed to process request');
	}
};
