// src/quiz-context/question-session/application/AutoGradeAnswer.usecase.ts
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import type { AutoGradeAnswerCommandPayload } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { v7 as randomUUIDv7 } from 'uuid';
import type { IGradingService } from '../domain/IGradingService';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export class AutoGradeAnswerUsecase {
	constructor(
		private readonly liveSessionRepository: ILiveSessionRepository,
		private readonly questionRepository: IQuestionRepository,
		private readonly gradingService: IGradingService,
		private readonly mq: IMessageQueue
	) {}

	async execute(command: AutoGradeAnswerCommandPayload): Promise<void> {
		console.log('AutoGradeAnswerUsecase executing', command);
		let session;
		try {
			// Optimization: Only load the specific student's answer
			session = await this.liveSessionRepository.findByIdForStudent(
				new LiveSessionId(command.liveSessionId),
				new StudentId(command.studentId)
			);
		} catch (e) {
			console.error('Error fetching session in AutoGradeAnswerUsecase', e);
			throw e;
		}

		if (!session) {
			console.error('LiveSession not found', { command });
			return;
		}
		console.log('Session found', session.id.id());

		const slot = session.getSlotByOrder(command.slotOrder);
		if (!slot) {
			console.error('Slot not found', { slotOrder: command.slotOrder });
			return;
		}

		const question = await this.questionRepository.findById(new QuestionId(slot.questionId.id()));
		if (!question) {
			console.error('Question not found', { questionId: slot.questionId.id() });
			return;
		}
		console.log('Question found', question.id.id());

		try {
			const answer = slot.getAnswerFromStudent(new StudentId(command.studentId));
			if (!answer) {
				console.error('Answer not found for student', { studentId: command.studentId });
				return;
			}

			const grade = await this.gradingService.gradeAnswer(
				question.text,
				answer.text,
				question.keyNotions
			);
			console.log('Grade generated', grade);

			// Instead of saving directly, push to queue
			const saveCommand = new SaveAutoGradeCommand({
				liveSessionId: command.liveSessionId,
				slotOrder: command.slotOrder,
				studentId: command.studentId,
				grade: {
					skillsMastered: grade.skillsMastered,
					skillsToReinforce: grade.skillsToReinforce,
					comment: grade.comment || ''
				}
			});

			await this.mq.add({
				name: SaveAutoGradeCommand.type,
				data: saveCommand.payload,
				opts: {
					jobId: `save-grade-${command.liveSessionId}-${command.slotOrder}-${command.studentId}-${randomUUIDv7()}`
				}
			});
			console.log('SaveAutoGradeCommand pushed to queue');

		} catch (e) {
			console.error('Error in AutoGradeAnswerUsecase', e);
			throw e;
		}
	}
}

