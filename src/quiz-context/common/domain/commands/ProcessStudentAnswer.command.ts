// src/quiz-context/common/domain/commands/ProcessStudentAnswer.command.ts
export class ProcessStudentAnswerCommand {
	static readonly type = 'question-session.process-student-answer';

	constructor(
		public readonly payload: {
			questionSessionId: string;
			studentId: string;
			answerText: string;
		}
	) {}
}
