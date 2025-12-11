// src/quiz-context/common/domain/commands/SaveAutoGrade.command.ts
export class SaveAutoGradeCommand {
	static readonly type = 'question-session.save-auto-grade';

	constructor(
		public readonly payload: {
			liveSessionId: string;
			slotOrder: number;
			studentId: string;
			grade: {
				skillsMastered: string[];
				skillsToReinforce: string[];
				comment: string;
			};
		}
	) {}
}

