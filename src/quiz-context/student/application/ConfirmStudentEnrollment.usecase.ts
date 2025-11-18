import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';
import z from 'zod';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import type { IStudentVerificationService } from '../domain/interfaces/IStudentVerificationService';

export const LinkStudentToPromotionCommandSchema = z.object({
	userToLinkEmail: z.email(),
	otp: z.string().min(6).max(6),
	authId: z.string()
});
type LinkStudentToPromotionCommand = z.infer<typeof LinkStudentToPromotionCommandSchema>;

export class ConfirmStudentEnrollmentUsecase {
	constructor(
		private readonly verificationService: IStudentVerificationService,
		private readonly studentRepository: IStudentRepository
	) {}

	async execute(command: LinkStudentToPromotionCommand) {
		const { userToLinkEmail, otp, authId } = command;

		const student = await this.studentRepository.findStudentByEmail(userToLinkEmail);

		if (!student) {
			throw new NotFoundError(`Student with email ${userToLinkEmail} not found`);
		}

		const verificationResult = await this.verificationService.verify(student.id, otp);
		if (!verificationResult.success) {
			return { success: false, error: verificationResult.error };
		}

		student.linkToUserAccount(authId);

		await this.studentRepository.save(student);

		return { success: true };
	}
}
