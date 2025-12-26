// src/quiz-context/question-session/application/RemoveQuestionFromSessionUsecase.ts
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type RemoveQuestionFromSessionCommand = {
	liveSessionId: string;
	slotOrder: number;
};

export class RemoveQuestionFromSessionUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: RemoveQuestionFromSessionCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Session not found');
		}

		if (session.status !== 'PENDING') {
			throw new Error('Cannot remove questions from a session that is not pending');
		}

		session.removeQuestion(command.slotOrder);

		await this.liveSessionRepository.save(session);
	}
}
