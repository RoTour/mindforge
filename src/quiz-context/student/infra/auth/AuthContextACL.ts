// @path: src/quiz-context/student/infra/auth/AuthContextACL.ts
import type { GenerateAndSendOtpUsecase } from '$auth/otp/application/GenerateAndSendOtp.usecase';
import type { VerifyOtpUsecase } from '$auth/otp/application/VerifyOtp.usecase';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { IStudentVerificationService } from '$quiz/student/domain/interfaces/IStudentVerificationService';

const OTP_PURPOSE = 'EMAIL_VERIFICATION';

export class AuthContextACL implements IStudentVerificationService {
	constructor(
		private readonly generateAndSendOtp: GenerateAndSendOtpUsecase,
		private readonly verifyOtp: VerifyOtpUsecase
	) {}

	async requestVerification(studentId: StudentId, email: string): Promise<void> {
		await this.generateAndSendOtp.execute({
			subjectId: studentId.id(),
			email: email,
			purpose: OTP_PURPOSE
		});
	}

	async verify(studentId: StudentId, otp: string): Promise<{ success: boolean; error?: string }> {
		const result = await this.verifyOtp.execute({
			subjectId: studentId.id(),
			code: otp,
			purpose: OTP_PURPOSE
		});

		if (!result.success) {
			return { success: false, error: result.error };
		}

		return { success: true };
	}
}
