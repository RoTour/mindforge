// @path: src/quiz-context/student/domain/errors/OTP.errors.ts
import { DomainError } from '$lib/ddd/errors/DomainError';

export class OTPAlreadyUsedError extends DomainError {
	constructor() {
		super('OTP has already been used.');
	}
}

export class OTPExpiredError extends DomainError {
	constructor() {
		super('OTP has expired.');
	}
}
