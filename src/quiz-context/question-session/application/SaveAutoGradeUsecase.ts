import type { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Grade } from '../domain/Grade.valueObject';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

export class SaveAutoGradeUsecase {
	constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

	async execute(command: SaveAutoGradeCommand['payload']): Promise<void> {
		const session = await this.questionSessionRepository.findByIdForStudent(
			new QuestionSessionId(command.questionSessionId),
			new StudentId(command.studentId)
		);

		if (!session) {
			console.error('QuestionSession not found in SaveAutoGradeUsecase', { command });
			return;
		}

		const grade = Grade.create({
			skillsMastered: command.grade.skillsMastered,
			skillsToReinforce: command.grade.skillsToReinforce,
			comment: command.grade.comment
		});

		try {
			session.autoGradeAnswer(new StudentId(command.studentId), grade);
			await this.questionSessionRepository.saveAnswer(session, session.getAnswerFromStudent(new StudentId(command.studentId))!);
			console.log(`Auto-grade saved for student ${command.studentId} in session ${command.questionSessionId}`);
		} catch (e) {
			console.error('Error saving auto-grade', e);
			throw e;
		}
	}
}
