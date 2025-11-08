// /Users/rotour/projects/mindforge/src/quiz-context/promotion/domain/PlannedQuestion.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class EndingDateBeforeStartingDateError extends DomainError {
	constructor() {
		super('Ending date cannot be before starting date.');
		this.name = 'EndingDateBeforeStartingDateError';
	}
}
