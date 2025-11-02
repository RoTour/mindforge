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

const handleTRPC: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(handleAuthRoot, handleTRPC);
