// src/quiz-context/views/dashboard/CreateQuestionFormVM.svelte.ts

import { createTRPC } from '$lib/trpc';

export class CreateQuestionFormVM {
	text = $state('');
	isLoading = $state(false);
	error = $state<string | null>(null);
	success = $state(false);

	constructor() {}

	async createQuestion() {
		if (this.text.length < 5) {
			this.error = 'Question text must be at least 5 characters long.';
			return;
		}

		this.isLoading = true;
		this.error = null;
		this.success = false;

		try {
			await createTRPC().question.createQuestion.mutate({ text: this.text });
			this.success = true;
			this.text = ''; // Reset form on success
		} catch (e) {
			this.error = e.message ?? 'An unknown error occurred.';
		} finally {
			this.isLoading = false;
		}
	}
}
