// @path: src/auth-context/otp/infra/OTPRepository/PrismaOTPRepository.ts
import type { Prisma, PrismaClient, OTP as PrismaOTP } from '$prisma/client';
import { OTP } from '../../domain/OTP.entity';
import { OTPId } from '../../domain/OTPId.valueObject';
import type { IOTPRepository } from '../../domain/interfaces/IOTPRepository';

class OTPMapper {
	static fromPrismaToDomain(prismaOtp: PrismaOTP): OTP {
		return OTP.rehydrate({
			id: new OTPId(prismaOtp.id),
			code: prismaOtp.code,
			expiresAt: prismaOtp.expiresAt,
			email: prismaOtp.email,
			used: prismaOtp.used,
			subjectId: prismaOtp.subjectId,
			purpose: prismaOtp.purpose
		});
	}

	static fromDomainToPrisma(otp: OTP): Prisma.OTPCreateInput & { id: string } {
		return {
			id: otp.id.id(),
			code: otp.code,
			expiresAt: otp.expiresAt,
			email: otp.email,
			used: otp.used,
			subjectId: otp.subjectId,
			purpose: otp.purpose
		};
	}
}

export class PrismaOTPRepository implements IOTPRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(otp: OTP): Promise<void> {
		const data = OTPMapper.fromDomainToPrisma(otp);

		await this.prisma.oTP.upsert({
			where: { id: otp.id.id() },
			create: data,
			update: data
		});
	}

	async findBySubjectIdAndPurpose(subjectId: string, purpose: string): Promise<OTP | null> {
		// This assumes you have a unique composite key in your schema: @@unique([subjectId, purpose])
		// This allows for an efficient lookup.
		const otp = await this.prisma.oTP.findFirst({
			where: {
				subjectId,
				purpose,
				used: false,
				expiresAt: {
					gt: new Date()
				}
			}
		});

		if (!otp) {
			return null;
		}

		return OTPMapper.fromPrismaToDomain(otp);
	}
}
