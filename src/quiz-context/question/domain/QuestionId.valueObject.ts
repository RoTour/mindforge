// src/quiz-context/domain/QuestionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class QuestionId extends EntityId {
	protected generateId(): string {
		return `Question-${randomUUIDv7()}`;
	}
}
