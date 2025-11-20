export type AutoGradeAnswerCommandPayload = {
	questionSessionId: string;
	studentId: string;
};

export class AutoGradeAnswerCommand {
	static readonly type = 'AutoGradeAnswer';

	constructor(public readonly payload: AutoGradeAnswerCommandPayload) {}
}
