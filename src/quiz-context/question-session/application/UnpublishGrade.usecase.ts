import type { IQuestionSessionRepository } from '$quiz/question-session/domain/IQuestionSessionRepository';
import { QuestionSessionId } from '$quiz/question-session/domain/QuestionSessionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class UnpublishGradeUsecase {
	constructor(private questionSessionRepository: IQuestionSessionRepository) {}

	async execute(questionSessionId: string, studentId: string): Promise<void> {
		const session = await this.questionSessionRepository.findById(
			new QuestionSessionId(questionSessionId)
		);

		if (!session) {
			throw new Error('Question session not found');
		}

		session.unpublishGrade(new StudentId(studentId));

		await this.questionSessionRepository.save(session);
	}
}
