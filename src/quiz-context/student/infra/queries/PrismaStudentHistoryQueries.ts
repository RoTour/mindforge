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
				questionSession: {
					promotionId
				}
			},
			include: {
				questionSession: {
					include: {
						question: true
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
				questionText: a.questionSession.question.text,
				answerText: a.text,
				submittedAt: a.submittedAt,
				grade: a.grade ?? undefined,
				assessment: a.assessment ?? undefined,
				session: {
					startedAt: a.questionSession.startedAt,
					status: a.questionSession.status
				}
			}))
		};
	}
}
