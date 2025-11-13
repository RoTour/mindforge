// src/quiz-context/question-session/infra/queries/PrismaStudentLobbyQueries.ts
import type { PrismaClient } from '$prisma/client';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type {
	IStudentLobbyQueries,
	ActiveQuestionSessionDTO
} from '../../application/queries/IStudentLobbyQueries';

export class PrismaStudentLobbyQueries implements IStudentLobbyQueries {
	constructor(private readonly client: PrismaClient) {}

	async getActiveQuestionSessions(promotionId: PromotionId): Promise<ActiveQuestionSessionDTO[]> {
		const activeSessions = await this.client.questionSession.findMany({
			where: {
				promotionId: promotionId.id(),
				status: 'ACTIVE'
			},
			select: {
				id: true,
				questionId: true,
				endsAt: true
			}
		});

		return activeSessions;
	}
}
