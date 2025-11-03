// src/lib/server/trpc/context.ts
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v10/context
 */
export async function createContext(event: RequestEvent) {
	const { authUserId } = event.locals;
	const context = {
		authUserId,
		teacher: null as null | { id: TeacherId } // will be filled in by teacherProcedure middleware
	};
	return context;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
