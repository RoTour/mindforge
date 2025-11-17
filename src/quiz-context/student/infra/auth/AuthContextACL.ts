// @path: src/quiz-context/student/infra/auth/AuthContextACL.ts
import type { GenerateAndSendOtpUsecase } from '$auth/otp/application/GenerateAndSendOtp.usecase';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { IStudentVerificationService } from '$quiz/student/domain/interfaces/IStudentVerificationService';

const OTP_PURPOSE = 'EMAIL_VERIFICATION';

export class AuthContextACL implements IStudentVerificationService {
	constructor(private readonly generateAndSendOtp: GenerateAndSendOtpUsecase) {}

	async requestVerification(studentId: StudentId, email: string): Promise<void> {
		await this.generateAndSendOtp.execute({
			subjectId: studentId.id(),
			email: email,
			purpose: OTP_PURPOSE
		});
	}
}
