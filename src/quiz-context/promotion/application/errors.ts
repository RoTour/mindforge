import { ApplicationError } from '$lib/ddd/errors/ApplicationError';

export class PromotionNotFoundError extends ApplicationError {
	constructor(id: string) {
		super(`Promotion not found: ${id}`);
	}
}
