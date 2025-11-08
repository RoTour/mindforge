// src/quiz-context/views/dashboard/CreateQuestionFormVM.svelte.ts

import { createTRPC } from '$lib/trpc';

export class CreateQuestionFormVM {
	text = $state('');
	keyNotions = $state<{ text: string; description: string }[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);
	success = $state(false);

	constructor() {}

	addEmptyKeyNotion = () => {
		const someKeyNotionEmpty = this.keyNotions.some((it) => it.text.trim() === '');
		if (someKeyNotionEmpty) {
			this.error = 'Please fill in the existing empty key notion before adding a new one.';
			return;
		}
		this.keyNotions.push({ text: '', description: '' });
	};

	removeKeyNotion = (index: number) => {
		this.keyNotions.splice(index, 1);
	};

	async createQuestion() {
		if (this.text.length < 5) {
			this.error = 'Question text must be at least 5 characters long.';
			return;
		}

		this.isLoading = true;
		this.error = null;
		this.success = false;

		try {
			await createTRPC().question.createQuestion.mutate({
				text: this.text,
				keyNotions: this.keyNotions.filter((it) => it.text.trim() !== '')
			});
			this.success = true;
			this.text = ''; // Reset form on success
			this.keyNotions = [];
		} catch (e: any) {
			this.error = e.message ?? 'An unknown error occurred.';
		} finally {
			this.isLoading = false;
		}
	}
}
