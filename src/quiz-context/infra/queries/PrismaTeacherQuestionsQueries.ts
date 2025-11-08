// src/quiz-context/infra/queries/PrismaTeacherQuestionsQueries.ts
import type { PrismaClient, Question as PrismaQuestion } from '$prisma/client';
import type {
	ITeacherQuestionsQueries,
	TeacherQuestionDTO
} from '$quiz/application/interfaces/ITeacherQuestionsQueries';
import type { KeyNotionProps } from '$quiz/domain/KeyNotion.valueObject';
import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

const toDTO = (question: PrismaQuestion): TeacherQuestionDTO => {
	return {
		id: question.id,
		text: question.text,
		authorId: question.authorId,
		keyNotions: (question.keyNotions as KeyNotionProps[] | null) ?? []
	};
};

export class PrismaTeacherQuestionsQueries implements ITeacherQuestionsQueries {
	constructor(private readonly prisma: PrismaClient) {}

	async getOwnQuestionsForPromotion(
		promotionId: PromotionId,
		teacherId: TeacherId
	): Promise<TeacherQuestionDTO[]> {
		const questions = await this.prisma.question.findMany({
			where: {
				authorId: teacherId.id(),
				questionSessions: {
					some: {
						promotionId: promotionId.id()
					}
				}
			},
			orderBy: {
				id: 'desc'
			}
		});

		return questions.map(toDTO);
	}

	async getAllOwnQuestionsForTeacher(teacherId: TeacherId): Promise<TeacherQuestionDTO[]> {
		const questions = await this.prisma.question.findMany({
			where: {
				authorId: teacherId.id()
			},
			orderBy: {
				id: 'desc'
			}
		});

		return questions.map(toDTO);
	}
}
