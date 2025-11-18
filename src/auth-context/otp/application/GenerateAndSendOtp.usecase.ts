// @path: src/auth-context/otp/application/GenerateAndSendOtp.usecase.ts
import { OTP } from '../domain/OTP.entity';
import type { IOTPRepository } from '../domain/interfaces/IOTPRepository';
import type { IEmailService } from '$quiz/student/application/interfaces/IEmailService';

export class GenerateAndSendOtpUsecase {
	constructor(
		private readonly otpRepository: IOTPRepository,
		private readonly emailService: IEmailService
	) {}

	public async execute(input: {
		subjectId: string;
		email: string;
		purpose: string;
	}): Promise<void> {
		const { subjectId, email, purpose } = input;

		// The repository's findBy... method should only return an active OTP.
		// We'll invalidate it before creating a new one.
		const existingOtp = await this.otpRepository.findBySubjectIdAndPurpose(subjectId, purpose);
		if (existingOtp) {
			existingOtp.use(); // Mark as used to invalidate it
			await this.otpRepository.save(existingOtp);
		}

		const otp = OTP.create({ subjectId, email, purpose });

		await this.otpRepository.save(otp);

		const emailSubject = this.getSubjectForPurpose(purpose);
		const emailBody = `<p>Your verification code is: <strong>${otp.code}</strong>. It will expire in 10 minutes.</p>`;

		console.debug('Sending OTP email to:', email, otp.code, emailBody);
		await this.emailService.sendEmail(email, emailSubject, emailBody);
	}

	private getSubjectForPurpose(purpose: string): string {
		switch (purpose) {
			case 'EMAIL_VERIFICATION':
				return 'Verify your email address';
			case 'PASSWORD_RESET':
				return 'Your password reset code';
			default:
				return 'Your verification code';
		}
	}
}
