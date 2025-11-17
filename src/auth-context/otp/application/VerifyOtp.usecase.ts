// @path: src/auth-context/otp/application/VerifyOtp.usecase.ts
import type { IOTPRepository } from '../domain/interfaces/IOTPRepository';

type VerifyOtpOutput = { success: true } | { success: false; error: string };

export class VerifyOtpUsecase {
	constructor(private readonly otpRepository: IOTPRepository) {}

	public async execute(input: {
		subjectId: string;
		code: string;
		purpose: string;
	}): Promise<VerifyOtpOutput> {
		const { subjectId, code, purpose } = input;

		const otp = await this.otpRepository.findBySubjectIdAndPurpose(subjectId, purpose);

		if (!otp) {
			// The repository method only returns active, non-used, non-expired OTPs.
			// So if we don't find one, it means there's no valid one for the given subject and purpose.
			return { success: false, error: 'No valid OTP found. Please request a new one.' };
		}

		if (!otp.matches(code)) {
			// Optional: could add logic to invalidate OTP after N failed attempts.
			return { success: false, error: 'The code you entered is incorrect.' };
		}

		// If we are here, the code is correct and the OTP is valid.
		otp.use();
		await this.otpRepository.save(otp);

		return { success: true };
	}
}
