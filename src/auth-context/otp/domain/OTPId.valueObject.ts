// @path: src/quiz-context/student/domain/OTPId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class OTPId extends EntityId {
	protected generateId(): string {
		return `otp-${crypto.randomUUID()}`;
	}
}
