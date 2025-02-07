import type { Question } from '../entities/Question';
import type { UIQuestion } from '../views/QuestionVM.svelte';

export const QuestionToUI = (question: Question): UIQuestion => {
	return {
		id: question.id,
		prompt: question.prompt,
		options: question.options ?? [],
		type: question.type,
	};
};