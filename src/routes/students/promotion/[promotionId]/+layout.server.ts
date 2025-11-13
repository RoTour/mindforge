// src/routes/students/promotion/[promotionId]/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirectOnTRPCError } from '$lib/server/trpc/guard';
import { StudentLobbyRouter } from '$quiz/student/adapters/StudentLobbyRouter';
import { createContext } from '$lib/server/trpc/context';
import { serialize } from '$lib/lib/utils';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const { promotionId } = params;

    try {
        const activeSession = await StudentLobbyRouter.createCaller(() => createContext(event))
            .getActiveSession({ promotionId });

        return {
            activeSession: activeSession ? serialize(activeSession) : null
        };
    } catch (e) {
        redirectOnTRPCError(e, {
            'UNAUTHORIZED': '/auth/sign-in',
            'FORBIDDEN': '/'
        });
    }
};
