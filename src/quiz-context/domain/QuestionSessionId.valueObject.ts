// src/quiz-context/domain/QuestionSessionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class QuestionSessionId extends EntityId {
	protected generateId(): string {
		return `QuestionSession-${crypto.randomUUID()}`;
	}
}
