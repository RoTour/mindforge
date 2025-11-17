// @path: src/auth-context/otp/domain/interfaces/IOTPRepository.ts
import type { OTP } from '../OTP.entity';

export interface IOTPRepository {
	save(otp: OTP): Promise<void>;
	findBySubjectIdAndPurpose(subjectId: string, purpose: string): Promise<OTP | null>;
}
