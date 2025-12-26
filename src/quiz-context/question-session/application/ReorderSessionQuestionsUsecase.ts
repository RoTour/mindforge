// src/quiz-context/question-session/application/ReorderSessionQuestionsUsecase.ts
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import { LiveSessionId } from '../domain/LiveSessionId.valueObject';

export type ReorderSessionQuestionsCommand = {
	liveSessionId: string;
	questionOrders: number[]; // New order as array of current slot orders
};

export class ReorderSessionQuestionsUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(command: ReorderSessionQuestionsCommand): Promise<void> {
		const sessionId = new LiveSessionId(command.liveSessionId);
		const session = await this.liveSessionRepository.findById(sessionId);

		if (!session) {
			throw new Error('Session not found');
		}

		if (session.status !== 'PENDING') {
			throw new Error('Cannot reorder questions in a session that is not pending');
		}

		session.reorderQuestions(command.questionOrders);

		await this.liveSessionRepository.save(session);
	}
}
