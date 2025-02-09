import type { Middleware } from '@reduxjs/toolkit';

export const AppLifecycleDebugMiddleware: Middleware = () => (next) => async (action) => {
	const result = await next(action);
	console.debug('AppLifecycle middleware action/result:', action, result);

	return result;
};