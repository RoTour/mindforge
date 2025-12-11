// src/quiz-context/question-session/infra/queries/PrismaTeacherSessionQueries.ts
import type { PrismaClient } from '$prisma/client';
import type {
    ITeacherSessionQueries,
    SessionListItem,
    SlotListItem
} from '$quiz/question-session/application/interfaces/ITeacherSessionQueries';

export class PrismaTeacherSessionQueries implements ITeacherSessionQueries {
	constructor(private readonly prisma: PrismaClient) {}

	async getSessionsForPromotion(promotionId: string): Promise<SessionListItem[]> {
		console.log('[PrismaTeacherSessionQueries] Querying sessions for promotionId:', promotionId);
		
		const sessions = await this.prisma.liveSession.findMany({
			where: {
				promotionId: promotionId
			},
			include: {
				slots: {
					include: {
						question: true,
						_count: {
							select: { answers: true }
						}
					},
					orderBy: {
						order: 'asc'
					}
				}
			},
			orderBy: {
				scheduledDate: 'desc'
			}
		});

		console.log('[PrismaTeacherSessionQueries] Found sessions:', sessions.length, sessions.map(s => ({ id: s.id, status: s.status, promotionId: s.promotionId })));

		return sessions.map((session) => {
			const slots: SlotListItem[] = session.slots.map((slot) => ({
				order: slot.order,
				questionId: slot.questionId,
				questionText: slot.question.text,
				status: slot.status as 'LOCKED' | 'UNLOCKED' | 'CLOSED',
				answerCount: slot._count.answers
			}));

			const currentUnlockedSlot = session.slots.find((s) => s.status === 'UNLOCKED');

			return {
				id: session.id,
				status: session.status as 'PENDING' | 'ACTIVE' | 'CLOSED',
				scheduledDate: session.scheduledDate,
				endsAt: session.endsAt,
				questionCount: session.slots.length,
				slots,
				currentUnlockedSlotOrder: currentUnlockedSlot?.order ?? null
			};
		});
	}
}
