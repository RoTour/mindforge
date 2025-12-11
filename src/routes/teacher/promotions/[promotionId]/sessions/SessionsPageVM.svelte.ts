// src/routes/teacher/promotions/[promotionId]/sessions/SessionsPageVM.svelte.ts
import { invalidateAll } from '$app/navigation';
import { createTRPC } from '$lib/trpc';
import type { SessionListItem } from '$quiz/question-session/application/interfaces/ITeacherSessionQueries';
import { toast } from 'svelte-sonner';

export class SessionsPageVM {
	sessions = $state<SessionListItem[]>([]);
	isLoading = $state(false);

	constructor(sessions: SessionListItem[]) {
		this.sessions = sessions;
	}

	async startSession(sessionId: string) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.startSession.mutate({ liveSessionId: sessionId });
			toast.success('Session started');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to start session');
		} finally {
			this.isLoading = false;
		}
	}

	async closeSession(sessionId: string) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.closeSession.mutate({ liveSessionId: sessionId });
			toast.success('Session closed');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to close session');
		} finally {
			this.isLoading = false;
		}
	}

	async unlockSlot(sessionId: string, slotOrder: number) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.unlockSlot.mutate({
				liveSessionId: sessionId,
				slotOrder
			});
			toast.success(`Slot ${slotOrder} unlocked`);
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to unlock slot');
		} finally {
			this.isLoading = false;
		}
	}
}
