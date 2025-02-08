// @modules/Learning/views/QuestionManagerVM.svelte.ts
import { QuestionToUI } from '../mappers/QuestionToUI';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import { JSONGetPendingQuestionsRepository } from '../usecases/GetPendingQuestions/repositories/JSONGetPendingQuestionsRepository';
import type { UIQuestion } from './QuestionVM.svelte';


export class QuestionManagerVM {
	private getPendingQuestionsUseCase;
	private $pendingQuestions: UIQuestion[] = $state([]);

	constructor() {
		const repository = JSONGetPendingQuestionsRepository();
		this.getPendingQuestionsUseCase = GetPendingQuestions({
			getUserQuestions: repository.getUserQuestions
		});

		this.loadPendingQuestions();
	}

	private async loadPendingQuestions() {
		const ucResult = await this.getPendingQuestionsUseCase.execute({ userId: '123' });
		if (ucResult.isSuccess) {
			return this.$pendingQuestions = ucResult.data.pendingQuestions.map(QuestionToUI);
		}
	}

	get pendingQuestions() {
		return this.$pendingQuestions;
	}
}
