// @path: src/auth-context/otp/infra/OTPRepository/InMemoryOTPRepository.ts
import type { OTP } from '../../domain/OTP.entity';
import type { IOTPRepository } from '../../domain/interfaces/IOTPRepository';

export class InMemoryOTPRepository implements IOTPRepository {
	private readonly otps = new Map<string, OTP>();

	async save(otp: OTP): Promise<void> {
		this.otps.set(otp.id.id(), otp);
	}

	async findBySubjectIdAndPurpose(subjectId: string, purpose: string): Promise<OTP | null> {
		for (const otp of this.otps.values()) {
			// In a real scenario with many OTPs, this would be inefficient.
			// A secondary index might be used. For testing, this is fine.
			if (otp.subjectId === subjectId && otp.purpose === purpose && !otp.used && !otp.isExpired()) {
				return otp;
			}
		}
		return null;
	}
}
