// src/quiz-context/domain/QuestionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class QuestionId extends EntityId {
	protected generateId(): string {
		return `Question-${crypto.randomUUID()}`;
	}
}
