// src/quiz-context/domain/errors/KeyNotion.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class KeyNotionTextEmptyError extends DomainError {
    constructor() {
        super('Key notion text cannot be empty.');
    }
}
