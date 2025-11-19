import { ApplicationError } from '$lib/ddd/errors/ApplicationError';

export class StudentNotFoundError extends ApplicationError {
	constructor(identifier: string) {
		super(`Student not found: ${identifier}`);
	}
}

export class StudentAlreadyLinkedError extends ApplicationError {
	constructor(studentId: string) {
		super(`Student ${studentId} is already linked to another user`);
	}
}
