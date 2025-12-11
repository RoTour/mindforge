// src/quiz-context/question-session/domain/LiveSession.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class SessionIsNotPendingError extends DomainError {
	constructor() {
		super('Session must be in PENDING status to start');
	}
}

export class SessionIsNotActiveError extends DomainError {
	constructor() {
		super('Session must be in ACTIVE status');
	}
}

export class SessionHasEndedError extends DomainError {
	constructor() {
		super('Session has ended, no more answers can be submitted');
	}
}
