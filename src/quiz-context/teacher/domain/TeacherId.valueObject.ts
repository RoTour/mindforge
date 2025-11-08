// /Users/rotour/projects/mindforge/src/quiz-context/domain/TeacherId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class TeacherId extends EntityId {
	protected generateId(): string {
		const uuid = crypto.randomUUID();
		return `Teacher-${uuid}`;
	}
}
