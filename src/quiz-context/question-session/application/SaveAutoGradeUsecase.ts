// src/quiz-context/question-session/application/SaveAutoGradeUsecase.ts
import type { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Grade } from '../domain/Grade.valueObject';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export class SaveAutoGradeUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: SaveAutoGradeCommand['payload']): Promise<void> {
		const session = await this.liveSessionRepository.findByIdForStudent(
			new LiveSessionId(command.liveSessionId),
			new StudentId(command.studentId)
		);

		if (!session) {
			console.error('LiveSession not found in SaveAutoGradeUsecase', { command });
			return;
		}

		const slot = session.getSlotByOrder(command.slotOrder);
		if (!slot) {
			console.error('Slot not found in SaveAutoGradeUsecase', { slotOrder: command.slotOrder });
			return;
		}

		const grade = Grade.create({
			skillsMastered: command.grade.skillsMastered,
			skillsToReinforce: command.grade.skillsToReinforce,
			comment: command.grade.comment
		});

		try {
			session.autoGradeAnswer(command.slotOrder, new StudentId(command.studentId), grade);
			const answer = slot.getAnswerFromStudent(new StudentId(command.studentId));
			if (answer) {
				await this.liveSessionRepository.saveAnswer(session, command.slotOrder, answer);
			}
			console.log(`Auto-grade saved for student ${command.studentId} in session ${command.liveSessionId}`);
		} catch (e) {
			console.error('Error saving auto-grade', e);
			throw e;
		}
	}
}

