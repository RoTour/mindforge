// src/quiz-context/question-session/domain/QuestionSlot.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class SlotIsNotUnlockedError extends DomainError {
	constructor() {
		super('Cannot submit answer: slot is not unlocked');
	}
}

export class StudentAlreadyAnsweredError extends DomainError {
	constructor() {
		super('Student has already answered this slot');
	}
}

export class SlotNotFoundError extends DomainError {
	constructor() {
		super('Question slot not found');
	}
}
