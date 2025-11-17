// @path: /Users/rotour/projects/mindforge/src/lib/server/resend.ts
import { Resend } from 'resend';

export const createResendClient = (apiKey: string) => {
	console.debug('Initializing Resend client');
	return new Resend(apiKey);
};
