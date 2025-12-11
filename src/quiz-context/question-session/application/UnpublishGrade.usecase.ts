// src/quiz-context/question-session/application/UnpublishGrade.usecase.ts
import type { ILiveSessionRepository } from '$quiz/question-session/domain/ILiveSessionRepository';
import { LiveSessionId } from '$quiz/question-session/domain/LiveSessionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class UnpublishGradeUsecase {
	constructor(private liveSessionRepository: ILiveSessionRepository) {}

	async execute(liveSessionId: string, slotOrder: number, studentId: string): Promise<void> {
		const session = await this.liveSessionRepository.findById(
			new LiveSessionId(liveSessionId)
		);

		if (!session) {
			throw new Error('Live session not found');
		}

		session.unpublishGrade(slotOrder, new StudentId(studentId));

		await this.liveSessionRepository.save(session);
	}
}

