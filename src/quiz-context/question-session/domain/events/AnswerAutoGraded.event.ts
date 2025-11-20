import type { IDomainEvent } from '$lib/ddd/interfaces/IDomainEvent';
import type { GradeProps } from '../Grade.valueObject';

export class AnswerAutoGraded implements IDomainEvent {
	public readonly occurredOn: Date;
	public readonly type = 'AnswerAutoGraded';
	public readonly payload: {
		questionSessionId: string;
		studentId: string;
		grade: GradeProps;
	};

	constructor(questionSessionId: string, studentId: string, grade: GradeProps) {
		this.occurredOn = new Date();
		this.payload = {
			questionSessionId,
			studentId,
			grade
		};
	}
}
