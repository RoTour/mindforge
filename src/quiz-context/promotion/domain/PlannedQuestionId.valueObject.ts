// /Users/rotour/projects/mindforge/src/quiz-context/promotion/domain/PlannedQuestionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class PlannedQuestionId extends EntityId {
	protected override generateId(): string {
		// "pln_qst" for "Planned Question"
		return `pln_qst-${randomUUIDv7()}`;
	}
}
