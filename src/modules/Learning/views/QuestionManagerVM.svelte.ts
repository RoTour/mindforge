// @modules/Learning/views/QuestionManagerVM.svelte.ts
import { RuneStore } from '@redux/runesStore.svelte';
import { QuestionToUI } from '../mappers/QuestionToUI';
import type { UIQuestion } from './QuestionVM.svelte';
import { store } from '@redux/store';

export class QuestionManagerVM {
	private $runeStore = new RuneStore(store);
	public displayedQuestion: UIQuestion | undefined = $derived(
		this.$runeStore.state.questions.pendingQuestions.map(QuestionToUI)[0]
	)

	constructor() {}
}
