import type { IEmailService } from './interfaces/IEmailService';
import type { IStudentQueries } from './interfaces/IStudentQueries';

export class TryLinkingStudentUsecase {
	constructor(
		private readonly studentQueries: IStudentQueries,
		private readonly emailService: IEmailService
	) {}

	async execute(email: string): Promise<void> {
		const student = await this.studentQueries.findStudentByEmail(email);
		if (!student) {
			return {
				success: false,
				message: 'No student found with the provided email.'
			};
		}

		const linkingCode = this.randomCodeService.generateCode();
		await this.studentQueries.saveLinkingCode(student.id, linkingCode);
	}
}
