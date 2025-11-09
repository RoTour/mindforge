import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { resolve as resolvePath } from '$app/paths';
import { sequence } from '@sveltejs/kit/hooks';
import '$lib/server/bullmq/bullmq';
import { quizMQ } from '$lib/server/bullmq/bullmq';

let initialized = false;

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

	return resolve(event);
};

const handleDebug: Handle = async ({ event, resolve }) => {
	if (!initialized) {
		await quizMQ.add('question-scheduling', { foo: 'bar' });
		initialized = true;
	}
	console.debug('Debug Hook', {
		url: event.url.href
	});
	return resolve(event);
};

export const handle = sequence(handleAuthRoot, handleAuth, handleAuthContext, handleDebug);
