// src/quiz-context/question-session/domain/QuestionSlotId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class QuestionSlotId extends EntityId {
	protected generateId(): string {
		return `QuestionSlot-${randomUUIDv7()}`;
	}
}

