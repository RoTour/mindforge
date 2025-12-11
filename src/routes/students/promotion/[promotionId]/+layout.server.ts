// src/routes/students/promotion/[promotionId]/+layout.server.ts
import { serialize } from '$lib/lib/utils';
import { createContext } from '$lib/server/trpc/context';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { StudentLobbyRouter } from '$quiz/student/adapters/StudentLobbyRouter';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { promotionId } = params;

	try {
		const lobbyData = await StudentLobbyRouter.createCaller(() =>
			createContext(event)
		).getActiveSession({ promotionId });

		return {
			lobbyData: lobbyData ? serialize(lobbyData) : null
		};
	} catch (e) {
		redirectOnTRPCError(e, {
			UNAUTHORIZED: '/auth/sign-in',
			FORBIDDEN: '/'
		});
	}
};

