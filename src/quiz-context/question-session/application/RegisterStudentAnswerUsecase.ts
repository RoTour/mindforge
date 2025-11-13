// src/quiz-context/question-session/application/RegisterStudentAnswerUsecase.ts
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Answer } from '../domain/Answer.entity';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

export type RegisterStudentAnswerCommand = {
	questionSessionId: string;
	studentId: string;
	answerText: string;
};

// Called by message queue consumer to register student answers without concurrency issues
export class RegisterStudentAnswerUsecase {
	constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

	async execute(command: RegisterStudentAnswerCommand): Promise<void> {
		const session = await this.questionSessionRepository.findById(
			new QuestionSessionId(command.questionSessionId)
		);
		if (!session) {
			console.error('Question session not found in RegisterStudentAnswerUsecase', { command });
			return;
		}

		const answer = new Answer({
			studentId: new StudentId(command.studentId),
			text: command.answerText,
			submittedAt: new Date()
		});

		try {
			session.submitAnswer(answer);
		} catch (e) {
			console.warn('Error submitting answer in RegisterStudentAnswerUsecase', {
				message: (e as Error).message,
				command
			});
			return;
		}

		await this.questionSessionRepository.save(session);

		// Domain events could be published here if other listeners need them.
	}
}
