// src/routes/students/promotion/[promotionId]/question/[questionId]/QuestionAnswerVM.svelte.ts
import { createTRPC } from '$lib/trpc';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export class QuestionAnswerVM {
	answer = $state('');
	isSubmitting = $state(false);
	isSubmitted = $state(false);
	countdown = $state(3);
	error = $state<string | null>(null);

	constructor(
		private readonly promotionId: string,
		private readonly questionSessionId: string
	) {}

	async submitAnswer() {
		if (!this.answer.trim()) {
			this.error = 'Answer cannot be empty.';
			return;
		}

		this.isSubmitting = true;
		this.error = null;

		try {
			await createTRPC().questionSession.submitAnswer.mutate({
				promotionId: this.promotionId,
				questionSessionId: this.questionSessionId,
				answerText: this.answer
			});

			this.isSubmitted = true;
			this.startCountdown();
		} catch (e: any) {
			this.error = e.message ?? 'An unknown error occurred.';
		} finally {
			this.isSubmitting = false;
		}
	}

	private startCountdown() {
		const interval = setInterval(() => {
			this.countdown--;
			if (this.countdown <= 0) {
				clearInterval(interval);
				console.log('Redirecting to lobby...');
				goto(resolve(`/students/promotion/${this.promotionId}/lobby`));
				// goto(`/students/promotion/${this.promotionId}/lobby`);
			}
		}, 1000);
	}
}
