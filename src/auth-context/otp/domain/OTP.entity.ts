// @path: src/quiz-context/student/domain/OTP.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { OTPId } from './OTPId.valueObject';
import { OTPAlreadyUsedError, OTPExpiredError } from './errors/OTP.errors';

// Business rules:
// - OTP is valid for 10 minutes
// - OTP is a 6-digit code
// - OTP can only be used once
// - OTP becomes invalid after being used or after expiring

const OTP_VALIDITY_IN_MINUTES = 10;

export class OTP extends AggregateRoot<OTPId> {
	public code!: string;
	public expiresAt!: Date;
	public email!: string;
	public used: boolean = false;
	public subjectId!: string;
	public purpose!: string;

	private constructor(id: OTPId, props: { subjectId: string; email: string; purpose: string }) {
		super(id);
		this.subjectId = props.subjectId;
		this.email = props.email;
		this.purpose = props.purpose;
	}

	public static create(props: { subjectId: string; email: string; purpose: string }): OTP {
		const id = new OTPId();
		const otp = new OTP(id, props);

		otp.code = Math.floor(100000 + Math.random() * 900000).toString();
		otp.expiresAt = new Date(Date.now() + OTP_VALIDITY_IN_MINUTES * 60 * 1000);
		otp.used = false;

		return otp;
	}

	public static rehydrate(props: {
		id: OTPId;
		subjectId: string;
		purpose: string;
		email: string;
		code: string;
		expiresAt: Date;
		used: boolean;
	}): OTP {
		const otp = new OTP(props.id, {
			subjectId: props.subjectId,
			email: props.email,
			purpose: props.purpose
		});
		otp.code = props.code;
		otp.expiresAt = props.expiresAt;
		otp.used = props.used;
		return otp;
	}

	public isExpired(): boolean {
		return new Date() > this.expiresAt;
	}

	public matches(code: string): boolean {
		return this.code === code;
	}

	public use(): void {
		if (this.used) {
			throw new OTPAlreadyUsedError();
		}
		if (this.isExpired()) {
			throw new OTPExpiredError();
		}
		this.used = true;
	}
}
