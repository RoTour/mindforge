// src/routes/+page.server.ts
import { serialize } from '$lib/lib/utils';
import { createContext } from '$lib/server/trpc/context';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { appRouter } from '$lib/server/trpc/router';
import { redirect } from '@sveltejs/kit';
import { TRPCError } from '@trpc/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const parentData = await event.parent(); // ensures that the auth load function has run
	if (parentData.userIsATeacher) {
		throw redirect(303, '/teacher/promotions');
	}
	try {
		const caller = appRouter.createCaller(await createContext(event));
		const [promotions, summaryStats, lastGradedQuestions, studentSkills] = await Promise.all([
			caller.studentDashboard.getMyPromotions(),
			caller.studentDashboard.getSummaryStats(),
			caller.studentDashboard.getLastGradedQuestions(),
			caller.studentDashboard.getStudentSkills()
		]);

		return {
			promotions: serialize(promotions),
			summaryStats: serialize(summaryStats),
			lastGradedQuestions: serialize(lastGradedQuestions),
			studentSkills: serialize(studentSkills)
		};
	} catch (e) {
		if (e instanceof TRPCError && e.code === 'FORBIDDEN') {
			// User is logged in, but not a student (or has no student profile).
			// This is not an exceptional case for the home page.
			// We can show them a different view (e.g. teacher dashboard link).
			return {
				promotions: [],
				summaryStats: {
					nbPromotionsEnrolled: 0,
					nbQuestionsAnswered: 0,
					nbTotalQuestions: 0,
					fullName: 'Anonymous Student'
				},
				lastGradedQuestions: [],
				studentSkills: {
					mastered: [],
					toReinforce: []
				}
			};
		}

		// For other errors, like UNAUTHORIZED, we can redirect.
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in'
		});
	}
};
