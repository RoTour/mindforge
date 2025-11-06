// src/quiz-context/domain/errors/Question.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class QuestionTextTooShortError extends DomainError {
    constructor() {
        super('Question text must be at least 5 characters long.');
    }
}
