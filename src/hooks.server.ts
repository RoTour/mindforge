import { auth } from '$lib/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { resolve as resolvePath } from '$app/paths';
import { sequence } from '@sveltejs/kit/hooks';

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
	console.debug('Debug Hook', {
		url: event.url.href
	});
	return resolve(event);
};

export const handle = sequence(handleAuthRoot, handleAuth, handleAuthContext, handleDebug);
