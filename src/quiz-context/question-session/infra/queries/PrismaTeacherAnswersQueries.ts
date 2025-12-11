// src/quiz-context/question-session/infra/queries/PrismaTeacherAnswersQueries.ts
import type { PrismaClient } from '$prisma/client';
import type {
    AnswerListItem,
    ITeacherAnswersQueries
} from '$quiz/question-session/application/interfaces/ITeacherAnswersQueries';

export class PrismaTeacherAnswersQueries implements ITeacherAnswersQueries {
	constructor(private readonly prisma: PrismaClient) {}

	async getAnswersForPromotion(promotionId: string): Promise<AnswerListItem[]> {
		const sessions = await this.prisma.liveSession.findMany({
			where: {
				promotionId: promotionId
			},
			include: {
				slots: {
					include: {
						question: true,
						answers: {
							include: {
								student: true,
								autoGrade: true,
								teacherGrade: true
							},
							orderBy: {
								submittedAt: 'desc'
							}
						}
					}
				}
			}
		});

		const answers: AnswerListItem[] = [];

		for (const session of sessions) {
			for (const slot of session.slots) {
				for (const answer of slot.answers) {
					answers.push({
						studentId: answer.studentId,
						studentName: answer.student.name,
						questionId: slot.questionId,
						questionText: slot.question.text,
						answerText: answer.text,
						submittedAt: answer.submittedAt,
						liveSessionId: session.id,
						slotOrder: slot.order,
						autoGrade: answer.autoGrade
							? {
									score: 0,
									status: 'COMPLETED',
									skillsMastered: answer.autoGrade.skillsMastered,
									skillsToReinforce: answer.autoGrade.skillsToReinforce,
									comment: answer.autoGrade.comment
								}
							: {
									score: 0,
									status: 'PENDING',
									skillsMastered: [],
									skillsToReinforce: [],
									comment: null
								},
						teacherGrade: answer.teacherGrade
							? {
									score: 0,
									skillsMastered: answer.teacherGrade.skillsMastered,
									skillsToReinforce: answer.teacherGrade.skillsToReinforce,
									comment: answer.teacherGrade?.comment ?? null
								}
							: null,
						isPublished: answer.isPublished
					});
				}
			}
		}

		// Sort by submittedAt desc across all sessions
		return answers.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
	}
}

