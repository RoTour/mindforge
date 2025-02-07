// @module/Learning/views/QuestionVM.svelte.ts
import { SvelteMap } from 'svelte/reactivity';
import { QuestionType } from '../entities/Question';

export type UIQuestion = {
	id: string;
	prompt: string;
	options: string[];
	type: QuestionType;
};

export class QuestionVM {
	private question: UIQuestion;
	answerSelection: Map<string, boolean> = new SvelteMap();

	constructor(question: UIQuestion) {
		this.question = question;
		question.options.forEach((option) => this.answerSelection.set(option, false));
	}

	get prompt() {
		return this.question.prompt;
	}

	get options() {
		return this.question.options;
	}

	get type() {
		return this.question.type;
	}

	isOptionSelected(option: string) {
		console.debug('isOptionSelected', option, this.answerSelection.get(option));
		return this.answerSelection.get(option) ?? false;
	}

	toggleSelect(option: string) {
		console.debug('toggleSelect', option);
		if (this.type === 'SIMPLE') {
			// Reset options before setting new one
			this.answerSelection.entries().forEach(([optionToReset, value]) => {
				if (!value) return;
				this.answerSelection.set(optionToReset, false);
			});
		}
		this.answerSelection.set(option, !this.answerSelection.get(option));
	}

	get answer() {
		const result = Object.entries(this.answerSelection)
			.filter(([, isSelected]) => isSelected)
			.map(([option]) => option);

		console.debug('answer', result);
		return result;
	}
}
