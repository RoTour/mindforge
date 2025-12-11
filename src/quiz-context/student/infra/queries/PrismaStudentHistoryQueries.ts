// src/quiz-context/student/infra/queries/PrismaStudentHistoryQueries.ts
import type { PrismaClient } from '$prisma/client';
import type {
    IStudentHistoryQueries,
    StudentHistoryDTO
} from '../../application/interfaces/IStudentHistoryQueries';

export class PrismaStudentHistoryQueries implements IStudentHistoryQueries {
	constructor(private readonly client: PrismaClient) {}

	async getStudentHistory(studentId: string, promotionId: string): Promise<StudentHistoryDTO> {
		const student = await this.client.student.findUniqueOrThrow({
			where: { id: studentId }
		});

		const answers = await this.client.answer.findMany({
			where: {
				studentId,
				questionSlot: {
					liveSession: {
						promotionId
					}
				}
			},
			include: {
				questionSlot: {
					include: {
						question: true,
						liveSession: true
					}
				}
			},
			orderBy: {
				submittedAt: 'desc'
			}
		});

		return {
			student: {
				id: student.id,
				name: student.name,
				lastname: student.lastName ?? undefined,
				email: student.email ?? undefined
			},
			answers: answers.map((a) => ({
				id: a.id,
				questionText: a.questionSlot.question.text,
				answerText: a.text,
				submittedAt: a.submittedAt,
				session: {
					startedAt: a.questionSlot.liveSession.scheduledDate,
					status: a.questionSlot.liveSession.status
				}
			}))
		};
	}
}

