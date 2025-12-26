// src/routes/teacher/promotions/[promotionId]/sessions/SessionsEditorVM.svelte.ts
import { invalidateAll } from '$app/navigation';
import { createTRPC } from '$lib/trpc';
import type { SessionListItem } from '$quiz/question-session/application/interfaces/ITeacherSessionQueries';
import type { TeacherQuestionDTO } from '$quiz/question/application/interfaces/ITeacherQuestionsQueries';
import { toast } from 'svelte-sonner';

export class SessionsEditorVM {
	sessions: SessionListItem[] = $state([]);
	questions: TeacherQuestionDTO[] = $state([]);
	promotionId: string = $state('');
	isLoading: boolean = $state(false);
	expandedSessionId: string | null = $state(null);
	selectedSessionId: string | null = $state(null);

	constructor(
		sessions: SessionListItem[],
		questions: TeacherQuestionDTO[],
		promotionId: string
	) {
		this.sessions = sessions;
		this.questions = questions;
		this.promotionId = promotionId;
	}

	toggleExpand(sessionId: string) {
		if (this.expandedSessionId === sessionId) {
			this.expandedSessionId = null;
		} else {
			this.expandedSessionId = sessionId;
		}
	}

	selectSession(sessionId: string) {
		this.selectedSessionId = sessionId;
		this.expandedSessionId = sessionId;
	}

	async createSession(scheduledDate: Date, endsAt: Date) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.createSession.mutate({
				promotionId: this.promotionId,
				scheduledDate,
				endsAt
			});
			toast.success('Session created');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to create session');
		} finally {
			this.isLoading = false;
		}
	}

	async addQuestionToSession(sessionId: string, questionId: string) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.addQuestion.mutate({
				liveSessionId: sessionId,
				questionId
			});
			toast.success('Question added');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to add question');
		} finally {
			this.isLoading = false;
		}
	}

	async removeQuestionFromSession(sessionId: string, slotOrder: number) {
		this.isLoading = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.sessions.removeQuestion.mutate({
				liveSessionId: sessionId,
				slotOrder
			});
			toast.success('Question removed');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to remove question');
		} finally {
			this.isLoading = false;
		}
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
}
