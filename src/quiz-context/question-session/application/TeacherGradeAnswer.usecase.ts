import { Grade } from '$quiz/question-session/domain/Grade.valueObject';
import type { IQuestionSessionRepository } from '$quiz/question-session/domain/IQuestionSessionRepository';
import { QuestionSessionId } from '$quiz/question-session/domain/QuestionSessionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class TeacherGradeAnswerUsecase {
	constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

	async execute(
		questionSessionId: string,
		studentId: string,
		grade: {
			skillsMastered: string[];
			skillsToReinforce: string[];
			comment: string | null;
		}
	): Promise<void> {
		const session = await this.questionSessionRepository.findById(
			new QuestionSessionId(questionSessionId)
		);

		if (!session) {
			throw new Error('Question session not found');
		}

		const gradeValueObject = Grade.create({
			skillsMastered: grade.skillsMastered,
			skillsToReinforce: grade.skillsToReinforce,
			comment: grade.comment ?? undefined
		});

		session.teacherGradeAnswer(new StudentId(studentId), gradeValueObject);

		await this.questionSessionRepository.save(session);
	}
}
