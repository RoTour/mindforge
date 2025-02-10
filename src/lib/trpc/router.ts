import { TRPCLearningRouter } from '@modules/Learning/gateways/router/TRPCLearningRouter';
import { t } from '$lib/trpc/t';

export const router = t.router({
	learning: TRPCLearningRouter
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;
