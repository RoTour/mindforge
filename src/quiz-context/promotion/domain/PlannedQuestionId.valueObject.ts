// /Users/rotour/projects/mindforge/src/quiz-context/promotion/domain/PlannedQuestionId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { randomUUID } from 'crypto';

export class PlannedQuestionId extends EntityId {
	protected override generateId(): string {
		// "pln_qst" for "Planned Question"
		return `pln_qst-${randomUUID()}`;
	}
}
