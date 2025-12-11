// src/quiz-context/common/domain/commands/AutoGradeAnswer.command.ts
export type AutoGradeAnswerCommandPayload = {
	liveSessionId: string;
	slotOrder: number;
	studentId: string;
};

export class AutoGradeAnswerCommand {
	static readonly type = 'AutoGradeAnswer';

	constructor(public readonly payload: AutoGradeAnswerCommandPayload) {}
}

