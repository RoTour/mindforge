// src/quiz-context/domain/QuestionSessionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class QuestionSessionId extends EntityId {
	protected generateId(): string {
		return `QuestionSession-${randomUUIDv7()}`;
	}
}
