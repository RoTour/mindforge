import type {
    GradedQuestionItem,
    IStudentDashboardQueries,
    StudentSkills
} from '$quiz/student/application/interfaces/IStudentDashboardQueries';
import type { PrismaClient } from '@prisma/client';

export class PrismaStudentDashboardQueries implements IStudentDashboardQueries {
	constructor(private prisma: PrismaClient) {}

	async getLastGradedQuestions(studentId: string, limit: number): Promise<GradedQuestionItem[]> {
		const answers = await this.prisma.answer.findMany({
			where: {
				studentId,
				isPublished: true
			},
			orderBy: {
				submittedAt: 'desc'
			},
			take: limit,
			include: {
				questionSession: {
					include: {
						question: true
					}
				},
				autoGrade: true,
				teacherGrade: true
			}
		});

		return answers.map((answer: any) => {
			// Prefer teacher grade if present (and published, which is implied by the query filter)
			const grade = answer.teacherGrade || answer.autoGrade;

			return {
				questionId: answer.questionSession.questionId,
				questionText: answer.questionSession.question.text,
				submittedAt: answer.submittedAt,
				grade: {
					score: 0, // We don't really use score yet
					skillsMastered: grade?.skillsMastered || [],
					skillsToReinforce: grade?.skillsToReinforce || [],
					comment: answer.teacherGrade?.comment || null
				}
			};
		});
	}

	async getStudentSkills(studentId: string): Promise<StudentSkills> {
		const answers = await this.prisma.answer.findMany({
			where: {
				studentId,
				isPublished: true
			},
			include: {
				autoGrade: true,
				teacherGrade: true
			}
		});

		const mastered = new Set<string>();
		const toReinforce = new Set<string>();

		for (const answer of answers) {
			const grade = answer.teacherGrade || answer.autoGrade;
			if (grade) {
				grade.skillsMastered.forEach((s: string) => mastered.add(s));
				grade.skillsToReinforce.forEach((s: string) => toReinforce.add(s));
			}
		}

		// Remove skills from 'toReinforce' if they are also in 'mastered' (assuming mastery overrides reinforcement needs)
		// Or keep them separate? The requirement says "aggregates". Let's keep them simple for now.
		// Actually, if I mastered it later, maybe I should remove it from toReinforce?
		// For now, let's just return unique sets.

		return {
			mastered: Array.from(mastered),
			toReinforce: Array.from(toReinforce)
		};
	}
}
