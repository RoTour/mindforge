import { building } from '$app/environment';
import { resolve as resolvePath } from '$app/paths';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/auth';
import '$lib/server/bullmq/bullmq';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { TRPCError } from '@trpc/server';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleAuthRoot: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	if (pathname === '/auth') {
		throw redirect(307, resolvePath('/auth/sign-in'));
	}
	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

const handleAuthContext: Handle = async ({ event, resolve }) => {
	const currentUser = await auth.api.getSession(event.request);
	event.locals.authUserId = currentUser?.user.id ?? null;
	event.locals.userEmail = currentUser?.user.email ?? null;

	return resolve(event);
};

const handleDebug: Handle = async ({ event, resolve }) => {
	console.debug('Debug Hook', {
		url: event.url.href,
		authUserId: event.locals.authUserId
	});
	return resolve(event);
};

export const handle = sequence(handleAuthRoot, handleAuth, handleAuthContext, handleDebug);

export const handleError = async ({ error }) => {
	const { DEBUG } = env;
	const content: Record<string, string> = {};
	if (error instanceof TRPCError) {
		content.message = error.message;
		content.code = error.code;
		content.isTRPCError = 'true';
	}
	if (error instanceof Error) {
		content.message = error.message;
		content.stack = error.stack ?? '';
		content.isTRPCError = 'false';
	}
	if (DEBUG === 'false') {
		delete content.stack;
	}
	console.error('Global Error Handler:', content);
};
