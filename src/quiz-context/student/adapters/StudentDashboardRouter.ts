import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { authedStudentProcedure } from '$lib/server/trpc/procedures/authedStudentProcedure';

export const StudentDashboardRouter = router({
	getMyPromotions: authedStudentProcedure.query(async ({ ctx }) => {
		const { id: studentId } = ctx.student;
		const promotions = await serviceProvider.StudentQueries.getStudentPromotions(studentId);
		return promotions;
	}),
	getSummaryStats: authedStudentProcedure.query(async ({ ctx }) => {
		const { id: studentId } = ctx.student;
		const stats = await serviceProvider.StudentQueries.getStudentSummaryStats(studentId);
		return stats;
	}),
	getLastGradedQuestions: authedStudentProcedure.query(async ({ ctx }) => {
		const { id: studentId } = ctx.student;
		return serviceProvider.StudentDashboardQueries.getLastGradedQuestions(studentId, 5);
	}),
	getStudentSkills: authedStudentProcedure.query(async ({ ctx }) => {
		const { id: studentId } = ctx.student;
		return serviceProvider.StudentDashboardQueries.getStudentSkills(studentId);
	})
});
