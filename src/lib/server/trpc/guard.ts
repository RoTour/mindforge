// @path: /Users/rotour/projects/mindforge/src/lib/server/trpc/guard.ts
import { TRPCError } from '@trpc/server';
import { redirect } from '@sveltejs/kit';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

type RedirectRules = Partial<Record<TRPC_ERROR_CODE_KEY, string>>;

/**
 * Handles TRPC errors, redirecting based on a set of rules.
 * If the error is not a TRPCError or no rule matches, it re-throws the error.
 * @param e The error caught in a catch block.
 * @param rules A map of tRPC error codes to redirect paths.
 */
export function redirectOnTRPCError(e: unknown, rules: RedirectRules): void {
	if (e instanceof TRPCError) {
		console.warn('redirectOnTRPCError invoked', e.message);
		const redirectPath = rules[e.code];
		if (redirectPath) {
			throw redirect(303, redirectPath);
		}
	}
}
