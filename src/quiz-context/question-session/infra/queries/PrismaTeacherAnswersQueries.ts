import type { PrismaClient } from '$prisma/client';
import type {
	AnswerListItem,
	ITeacherAnswersQueries
} from '$quiz/question-session/application/interfaces/ITeacherAnswersQueries';

export class PrismaTeacherAnswersQueries implements ITeacherAnswersQueries {
	constructor(private readonly prisma: PrismaClient) {}

	async getAnswersForPromotion(promotionId: string): Promise<AnswerListItem[]> {
		const sessions = await this.prisma.questionSession.findMany({
			where: {
				promotionId: promotionId
			},
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
		});

		const answers: AnswerListItem[] = [];

		for (const session of sessions) {
			for (const answer of session.answers) {
				answers.push({
					studentId: answer.studentId,
					studentName: answer.student.name,
					questionId: session.questionId,
					questionText: session.question.text, // Assuming title is the text or close to it
					answerText: answer.text,
					submittedAt: answer.submittedAt,
					autoGrade: answer.autoGrade
						? {
								score: 0, // TODO: Calculate score if applicable, or just show status
								status: 'COMPLETED'
							}
						: {
								score: 0,
								status: 'PENDING' // Or failed, need to check how to determine failed
							},
					teacherGrade: answer.teacherGrade
						? {
								score: 0
							}
						: undefined
				});
			}
		}

		// Sort by submittedAt desc across all sessions
		return answers.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
	}
}
