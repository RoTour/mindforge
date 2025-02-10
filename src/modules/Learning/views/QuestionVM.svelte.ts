// @module/Learning/views/QuestionVM.svelte.ts
import type { AppStore } from '@redux/store';
import { store } from '@redux/store';
import { SvelteMap } from 'svelte/reactivity';
import { QuestionType } from '../entities/Question';
import { questionAnswerSubmitted } from '../events/QuestionActions';

export type UIQuestion = {
	id: string;
	prompt: string;
	options: string[];
	type: QuestionType;
};

type QuestionVMProps = {
	question: UIQuestion;
	reduxStore?: AppStore;
};

export class QuestionVM {
	private question: UIQuestion;
	propositionsSelection: Map<string, boolean> = new SvelteMap();
	private reduxStore: AppStore;

	constructor({ question, reduxStore = store }: QuestionVMProps) {
		this.question = question;
		this.reduxStore = reduxStore;
		question.options.forEach((option) => this.propositionsSelection.set(option, false));
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
		return this.propositionsSelection.get(option) ?? false;
	}

	toggleSelect(option: string) {
		if (this.type === 'SIMPLE') {
			// Reset options before setting new one
			Array.from(this.propositionsSelection).forEach(([optionToReset]) => {
				if (!this.propositionsSelection.get(optionToReset)) return;
				this.propositionsSelection.set(optionToReset, false);
			});
		}
		this.propositionsSelection.set(option, !this.propositionsSelection.get(option));
	}

	get propositions() {
		return Array.from(this.propositionsSelection)
			.filter(([, isSelected]) => isSelected)
			.map(([option]) => option);
	}

	async submit() {
		console.debug("Submit question called")
		this.reduxStore.dispatch(questionAnswerSubmitted({ questionId: this.question.id, propositions: this.propositions }));
		// const repository = JSONValidateQuestionRepository();
		// const result = await ValidateQuestion({
		// 	getQuestionAnswer: repository.getQuestionToValidate
		// }).execute({
		// 	questionId: this.question.id,
		// 	propositions: this.propositions
		// });
		// if (!result.isSuccess) {
		// 	this.reduxStore.dispatch(errorHandled({ message: result.message }));
		// 	return;
		// }
		// this.reduxStore.dispatch(questionAnswerSubmitted({ question: this.question, success: true }));
		
	}
}
