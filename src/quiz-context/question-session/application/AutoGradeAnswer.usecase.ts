import type { AutoGradeAnswerCommandPayload } from '$quiz/common/domain/commands/AutoGradeAnswer.command';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { IGradingService } from '../domain/IGradingService';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

export class AutoGradeAnswerUsecase {
	constructor(
		private readonly questionSessionRepository: IQuestionSessionRepository,
		private readonly questionRepository: IQuestionRepository,
		private readonly gradingService: IGradingService
	) {}

	async execute(command: AutoGradeAnswerCommandPayload): Promise<void> {
		console.log('AutoGradeAnswerUsecase executing', command);
		let session;
		try {
			session = await this.questionSessionRepository.findById(
				new QuestionSessionId(command.questionSessionId)
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
			const grade = await this.gradingService.gradeAnswer(
				question.text,
				session.getAnswerFromStudent(new StudentId(command.studentId))?.text || '',
				question.keyNotions
			);
			console.log('Grade generated', grade);

			session.autoGradeAnswer(new StudentId(command.studentId), grade);
			console.log('Answer graded in session');

			await this.questionSessionRepository.save(session);
			console.log('Session saved');
		} catch (e) {
			console.error('Error in AutoGradeAnswerUsecase', e);
			throw e;
		}
	}
}
