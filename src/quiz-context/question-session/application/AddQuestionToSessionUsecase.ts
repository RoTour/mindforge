// src/quiz-context/question-session/application/AddQuestionToSessionUsecase.ts
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type AddQuestionToSessionCommand = {
	liveSessionId: string;
	questionId: string;
};

export class AddQuestionToSessionUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: AddQuestionToSessionCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Session not found');
		}

		if (session.status !== 'PENDING') {
			throw new Error('Cannot add questions to a session that is not pending');
		}

		const questionId = new QuestionId(command.questionId);
		session.addQuestion(questionId);

		await this.liveSessionRepository.save(session);
	}
}
