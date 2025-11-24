export class SaveAutoGradeCommand {
	static readonly type = 'question-session.save-auto-grade';

	constructor(
		public readonly payload: {
			questionSessionId: string;
			studentId: string;
			grade: {
				skillsMastered: string[];
				skillsToReinforce: string[];
				comment: string;
			};
		}
	) {}
}
