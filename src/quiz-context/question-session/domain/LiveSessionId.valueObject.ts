// src/quiz-context/question-session/domain/LiveSessionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class LiveSessionId extends EntityId {
	protected generateId(): string {
		return `LiveSession-${randomUUIDv7()}`;
	}
}

