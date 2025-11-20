import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { authedAnyUserProcedure } from '$lib/server/trpc/procedures/authedAnyUserProcedure';
import { teacherProcedure } from '$lib/server/trpc/procedures/teacherProcedure';
import z from 'zod';
import { ConfirmStudentEnrollmentUsecase } from '../application/ConfirmStudentEnrollment.usecase';
import { CreateStudentAndLinkUsecase } from '../application/CreateStudentAndLink.usecase';
import { LinkStudentToUserUsecase } from '../application/LinkStudentToUser.usecase';
import { RemoveStudentFromPromotionUsecase } from '../application/RemoveStudentFromPromotion.usecase';
import { TryLinkingStudentUsecase } from '../application/TryLinkingStudent.usecase';
import { CreateStudentForPromotionUsecase } from '../application/CreateStudentForPromotion.usecase';

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
		}),
	linkStudentToUser: teacherProcedure
		.input(
			z.object({
				studentId: z.string(),
				authId: z.string(),
				email: z.string().email()
			})
		)
		.mutation(async ({ input }) => {
			const { studentId, authId, email } = input;
			const usecase = new LinkStudentToUserUsecase(serviceProvider.StudentRepository);
			await usecase.execute(studentId, authId, email);
		}),
	createStudentAndLink: teacherProcedure
		.input(
			z.object({
				firstName: z.string(),
				lastName: z.string(),
				authId: z.string(),
				email: z.string().email(),
				promotionId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const usecase = new CreateStudentAndLinkUsecase(
				serviceProvider.StudentRepository,
				serviceProvider.PromotionRepository
			);
			await usecase.execute(input);
		}),
	removeStudentFromPromotion: teacherProcedure
		.input(
			z.object({
				studentId: z.string(),
				promotionId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const { studentId, promotionId } = input;
			const usecase = new RemoveStudentFromPromotionUsecase(serviceProvider.PromotionRepository);
			await usecase.execute(promotionId, studentId);
		}),
	createStudentForPromotion: teacherProcedure
		.input(
			z.object({
				firstName: z.string(),
				lastName: z.string(),
				email: z.string().email(),
				promotionId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const usecase = new CreateStudentForPromotionUsecase(
				serviceProvider.StudentRepository,
				serviceProvider.PromotionRepository
			);
			await usecase.execute(input);
		}),
	getStudentHistory: teacherProcedure
		.input(
			z.object({
				studentId: z.string(),
				promotionId: z.string()
			})
		)
		.query(async ({ input }) => {
			const { studentId, promotionId } = input;
			const history = await serviceProvider.StudentHistoryQueries.getStudentHistory(
				studentId,
				promotionId
			);
			return history;
		})
});

export type StudentsOverviewRouter = typeof router;
