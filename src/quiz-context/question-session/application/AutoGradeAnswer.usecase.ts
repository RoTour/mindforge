import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';
import type { AutoGradeAnswerCommandPayload } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import { SaveAutoGradeCommand } from '$quiz/common/domain/commands/SaveAutoGrade.command';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { v7 as randomUUIDv7 } from 'uuid';
import type { IGradingService } from '../domain/IGradingService';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

export class AutoGradeAnswerUsecase {
	constructor(
		private readonly questionSessionRepository: IQuestionSessionRepository,
		private readonly questionRepository: IQuestionRepository,
		private readonly gradingService: IGradingService,
		private readonly mq: IMessageQueue
	) {}

	async execute(command: AutoGradeAnswerCommandPayload): Promise<void> {
		console.log('AutoGradeAnswerUsecase executing', command);
		let session;
		try {
			// Optimization: Only load the specific student's answer
			session = await this.questionSessionRepository.findByIdForStudent(
				new QuestionSessionId(command.questionSessionId),
				new StudentId(command.studentId)
			);
		} catch (e) {
			console.error('Error fetching session in AutoGradeAnswerUsecase', e);
			throw e;
		}

		if (!session) {
			console.error('QuestionSession not found', { command });
			return;
		}
		console.log('Session found', session.id.id());

		const question = await this.questionRepository.findById(session.questionId);
		if (!question) {
			console.error('Question not found', { questionId: session.questionId.id() });
			return;
		}
		console.log('Question found', question.id.id());

		try {
			const answer = session.getAnswerFromStudent(new StudentId(command.studentId));
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
				questionSessionId: command.questionSessionId,
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
					jobId: `save-grade-${command.questionSessionId}-${command.studentId}-${randomUUIDv7()}`
				}
			});
			console.log('SaveAutoGradeCommand pushed to queue');

		} catch (e) {
			console.error('Error in AutoGradeAnswerUsecase', e);
			throw e;
		}
	}
}
