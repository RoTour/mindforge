// src/quiz-context/question-session/application/TeacherGradeAnswer.usecase.ts
import { Grade } from '$quiz/question-session/domain/Grade.valueObject';
import type { ILiveSessionRepository } from '$quiz/question-session/domain/ILiveSessionRepository';
import { LiveSessionId } from '$quiz/question-session/domain/LiveSessionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class TeacherGradeAnswerUsecase {
	constructor(private readonly liveSessionRepository: ILiveSessionRepository) {}

	async execute(
		liveSessionId: string,
		slotOrder: number,
		studentId: string,
		grade: {
			skillsMastered: string[];
			skillsToReinforce: string[];
			comment: string | null;
		}
	): Promise<void> {
		const session = await this.liveSessionRepository.findById(
			new LiveSessionId(liveSessionId)
		);

		if (!session) {
			throw new Error('Live session not found');
		}

		const gradeValueObject = Grade.create({
			skillsMastered: grade.skillsMastered,
			skillsToReinforce: grade.skillsToReinforce,
			comment: grade.comment ?? undefined
		});

		session.teacherGradeAnswer(slotOrder, new StudentId(studentId), gradeValueObject);

		await this.liveSessionRepository.save(session);
	}
}

