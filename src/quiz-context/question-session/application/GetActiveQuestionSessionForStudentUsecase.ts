// src/quiz-context/question-session/application/GetActiveQuestionSessionForStudentUsecase.ts
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type {
	ActiveQuestionSessionDTO,
	IStudentLobbyQueries
} from './queries/IStudentLobbyQueries';

export type GetActiveQuestionSessionForStudentCommand = {
	promotionId: string;
};

export class GetActiveQuestionSessionForStudentUsecase {
	constructor(private readonly studentLobbyQueries: IStudentLobbyQueries) {}

	async execute(
		command: GetActiveQuestionSessionForStudentCommand
	): Promise<ActiveQuestionSessionDTO | null> {
		const promotionId = new PromotionId(command.promotionId);
		const activeSessions = await this.studentLobbyQueries.getActiveQuestionSessions(promotionId);

		if (activeSessions.length === 0) {
			return null;
		}

		if (activeSessions.length === 1) {
			return activeSessions[0];
		}

		// Sort sessions by the closest endsAt date (ascending)
		const sortedSessions = [...activeSessions].sort((a, b) => {
			return a.endsAt.getTime() - b.endsAt.getTime();
		});

		return sortedSessions[0];
	}
}
