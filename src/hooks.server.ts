import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createTRPCHandle } from 'trpc-sveltekit';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';

const handleParaglide: Handle = i18n.handle();
const handleTrpc: Handle = createTRPCHandle({ router, createContext });

export const handle: Handle = sequence(handleParaglide, handleTrpc);