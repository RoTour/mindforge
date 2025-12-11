// src/quiz-context/question-session/application/GetActiveLiveSessionForStudentUsecase.ts
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { ILiveSessionRepository } from '../domain/ILiveSessionRepository';
import type { LiveSession } from '../domain/LiveSession.entity';

export type GetActiveLiveSessionForStudentCommand = {
	promotionId: string;
	studentId: string;
};

export type StudentLobbyView = {
	session: LiveSession;
	previousSlots: { order: number; questionId: string; answered: boolean }[];
	currentSlot: { order: number; questionId: string; answered: boolean } | null;
	hasNextQuestion: boolean;
};

export class GetActiveLiveSessionForStudentUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(
		command: GetActiveLiveSessionForStudentCommand
	): Promise<StudentLobbyView | null> {
		const promotionId = new PromotionId(command.promotionId);
		const studentId = new StudentId(command.studentId);

		// Find active sessions with unlocked slots the student hasn't answered
		const activeSessions = await this.liveSessionRepository.findActiveByPromotionIdForStudent(
			promotionId,
			studentId
		);

		if (activeSessions.length === 0) {
			// Also check for active sessions where the student HAS answered all unlocked
			// (they should still see the lobby with their answers)
			const allActiveSessions = await this.liveSessionRepository.findActiveByPromotionId(
				promotionId
			);
			if (allActiveSessions.length === 0) {
				return null;
			}
			// Return the first active session
			const session = allActiveSessions[0];
			return this.buildLobbyView(session, studentId);
		}

		// Sort by earliest endsAt
		const sortedSessions = [...activeSessions].sort((a, b) => {
			return a.endsAt.getTime() - b.endsAt.getTime();
		});

		return this.buildLobbyView(sortedSessions[0], studentId);
	}

	private buildLobbyView(session: LiveSession, studentId: StudentId): StudentLobbyView {
		const previousSlots: StudentLobbyView['previousSlots'] = [];
		let currentSlot: StudentLobbyView['currentSlot'] = null;
		let hasNextQuestion = false;

		// Sort slots by order
		const sortedSlots = [...session.slots].sort((a, b) => a.order - b.order);

		for (const slot of sortedSlots) {
			const answered = slot.hasStudentAnswered(studentId);

			if (slot.status === 'CLOSED') {
				previousSlots.push({
					order: slot.order,
					questionId: slot.questionId.id(),
					answered
				});
			} else if (slot.status === 'UNLOCKED') {
				if (!currentSlot) {
					currentSlot = {
						order: slot.order,
						questionId: slot.questionId.id(),
						answered
					};
				}
			} else if (slot.status === 'LOCKED') {
				hasNextQuestion = true;
			}
		}

		return {
			session,
			previousSlots,
			currentSlot,
			hasNextQuestion
		};
	}
}
