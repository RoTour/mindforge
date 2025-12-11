// src/quiz-context/question-session/infra/LiveSessionRepository/InMemoryLiveSessionRepository.ts
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { Answer } from '$quiz/question-session/domain/Answer.entity';
import type { ILiveSessionRepository } from '$quiz/question-session/domain/ILiveSessionRepository';
import type { LiveSession } from '$quiz/question-session/domain/LiveSession.entity';
import type { LiveSessionId } from '$quiz/question-session/domain/LiveSessionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class InMemoryLiveSessionRepository implements ILiveSessionRepository {
	private readonly sessions = new Map<string, LiveSession>();

	async save(session: LiveSession): Promise<void> {
		this.sessions.set(session.id.id(), session);
	}

	async saveAnswer(session: LiveSession, _slotOrder: number, _answer: Answer): Promise<void> {
		// In-memory implementation just saves the whole session
		this.sessions.set(session.id.id(), session);
	}

	async findById(id: LiveSessionId): Promise<LiveSession | null> {
		return this.sessions.get(id.id()) ?? null;
	}

	async findByIdForStudent(
		id: LiveSessionId,
		_studentId: StudentId
	): Promise<LiveSession | null> {
		// For in-memory, we just return the full session
		return this.sessions.get(id.id()) ?? null;
	}

	async findActiveByPromotionId(promotionId: PromotionId): Promise<LiveSession[]> {
		return Array.from(this.sessions.values()).filter(
			(s) => s.promotionId.equals(promotionId) && s.status === 'ACTIVE'
		);
	}

	async findActiveByPromotionIdForStudent(
		promotionId: PromotionId,
		studentId: StudentId
	): Promise<LiveSession[]> {
		return Array.from(this.sessions.values()).filter((s) => {
			if (!s.promotionId.equals(promotionId) || s.status !== 'ACTIVE') {
				return false;
			}
			// Check if there's at least one unlocked slot the student hasn't answered
			return s.slots.some(
				(slot) =>
					slot.status === 'UNLOCKED' && !slot.hasStudentAnswered(studentId)
			);
		});
	}
}
