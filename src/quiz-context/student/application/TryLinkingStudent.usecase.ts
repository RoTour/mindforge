import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import type { IStudentVerificationService } from '../domain/interfaces/IStudentVerificationService';

type TryLinkingStudentOutput = { success: true } | { success: false; message: string };

export class TryLinkingStudentUsecase {
	constructor(
		private readonly studentRepository: IStudentRepository,
		private readonly studentVerificationService: IStudentVerificationService
	) {}

	async execute(email: string): Promise<TryLinkingStudentOutput> {
		const student = await this.studentRepository.findStudentByEmail(email);
		if (!student) {
			return {
				success: false,
				message: 'No student found with the provided email.'
			};
		}

		// The student object from the repository is a full domain aggregate
		if (!student.email) {
			return {
				success: false,
				message: 'Student has no email to verify.'
			};
		}

		// Delegate sending the verification to the ACL
		await this.studentVerificationService.requestVerification(student.id, student.email);

		return { success: true };
	}
}
