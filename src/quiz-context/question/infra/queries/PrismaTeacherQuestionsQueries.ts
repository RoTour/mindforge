// src/quiz-context/infra/queries/PrismaTeacherQuestionsQueries.ts
import type { PrismaClient, Question as PrismaQuestion } from '$prisma/client';
import type {
	ITeacherQuestionsQueries,
	PlannedQuestionDTO,
	TeacherQuestionDTO
} from '$quiz/question/application/interfaces/ITeacherQuestionsQueries';
import type { KeyNotionProps } from '$quiz/question/domain/KeyNotion.valueObject';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

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

	async getPlannedQuestionsForPromotion(
		promotionId: PromotionId,
		teacherId: TeacherId
	): Promise<PlannedQuestionDTO[]> {
		// This assumes a `PlannedQuestion` model exists that links questions and promotions.
		const plannedQuestions = await this.prisma.plannedQuestion.findMany({
			where: {
				promotionId: promotionId.id(),
				// Security check: ensure the promotion is owned by the teacher
				promotion: {
					teacherId: teacherId.id()
				}
			},
			include: {
				// We need the full question details
				question: true
			},
			orderBy: {
				startingOn: 'asc'
			}
		});

		return plannedQuestions.map((pq) => {
			const questionDTO = toDTO(pq.question);
			return {
				id: pq.id,
				keyNotions: questionDTO.keyNotions,
				questionId: questionDTO.id,
				text: questionDTO.text,
				authorId: questionDTO.authorId,
				startingOn: pq.startingOn,
				endingOn: pq.endingOn
			};
		});
	}
}
