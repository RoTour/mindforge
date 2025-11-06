// src/quiz-context/application/errors/NotFoundError.ts
import { ApplicationError } from '$lib/ddd/errors/ApplicationError';

export class NotFoundError extends ApplicationError {
	constructor(message: string) {
		super(message);
	}
}
