import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { authedAnyUserProcedure } from '$lib/server/trpc/procedures/authedAnyUserProcedure';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import z from 'zod';
import { ConfirmStudentEnrollmentUsecase } from '../application/ConfirmStudentEnrollment.usecase';
import { TryLinkingStudentUsecase } from '../application/TryLinkingStudent.usecase';

export const StudentsOverviewRouter = router({
	getStudentsFromPromotion: teacherProcedure
		.input(
			z.object({
				promotionId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { promotionId } = input;
			const { id: teacherId } = ctx.teacher;
			const students = await serviceProvider.StudentsOverviewQueries.getStudentsFromPromotion(
				promotionId,
				teacherId.id()
			);
			return students;
		}),
	tryLinkingStudent: authedAnyUserProcedure
		.input(z.object({ email: z.email() }))
		.mutation(async ({ input }) => {
			const usecase = new TryLinkingStudentUsecase(
				serviceProvider.StudentRepository,
				serviceProvider.services.StudentVerificationService
			);
			const result = await usecase.execute(input.email);
			return result;
		}),
	enrollToPromotion: authedAnyUserProcedure
		.input(
			z.object({
				promotionId: z.string(),
				email: z.email(),
				otp: z.string().min(6).max(6)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { email, otp } = input;
			const { authUserId } = ctx;
			const usecase = new ConfirmStudentEnrollmentUsecase(
				serviceProvider.services.StudentVerificationService,
				serviceProvider.StudentRepository
			);
			const result = await usecase.execute({
				otp,
				authId: authUserId,
				userToLinkEmail: email
			});
			return result;
		})
});

export type StudentsOverviewRouter = typeof router;
