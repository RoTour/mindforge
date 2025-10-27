import { ApplicationError } from '$ddd/errors/ApplicationError';

export class BadRequestError extends ApplicationError {
	constructor(reason: string) {
		super(`Bad Request: ${reason}`);
	}
}
