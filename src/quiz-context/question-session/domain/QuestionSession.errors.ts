// src/quiz-context/domain/errors/QuestionSession.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class SessionIsNotPendingError extends DomainError {
	constructor() {
		super('Session can only be started if it is pending.');
	}
}

export class SessionIsNotActiveError extends DomainError {
	constructor() {
		super('Operation can only be performed on an active session.');
	}
}

export class SessionHasEndedError extends DomainError {
	constructor() {
		super('Cannot submit answer after the session has ended.');
	}
}

export class StudentAlreadyAnsweredError extends DomainError {
	constructor() {
		super('Student has already submitted an answer for this session.');
	}
}
