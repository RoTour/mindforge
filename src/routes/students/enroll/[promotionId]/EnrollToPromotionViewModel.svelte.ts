import { createTRPC, type TRPCClient } from '$lib/trpc';

export class EnrollToPromotionViewModel {
	trpc: TRPCClient | null = null;
	authStep:
		| 'enter email'
		| 'searching student'
		| 'student found'
		| 'student not found'
		| 'enrolled' = $state('enter email');

	constructor() {}

	async handleEmailSubmitted(e: Event) {
		e.preventDefault();
		this.trpc ??= createTRPC();
		this.trpc.student;
	}
}
