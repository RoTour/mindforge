import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import type { QuestionSession } from '../domain/QuestionSession.entity';

export type GetActiveQuestionSessionForStudentCommand = {
	promotionId: string;
	studentId: string;
};

export class GetActiveQuestionSessionForStudentUsecase {
	constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

	async execute(
		command: GetActiveQuestionSessionForStudentCommand
	): Promise<QuestionSession | null> {
		const promotionId = new PromotionId(command.promotionId);
		const studentId = new StudentId(command.studentId);
		const activeSessions = await this.questionSessionRepository.findActiveByPromotionIdForStudent(
			promotionId,
			studentId
		);

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
