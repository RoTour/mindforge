// @path: src/routes/students/enroll/[promotionId]/EnrollToPromotionVM.svelte.ts
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { createTRPC, type TRPCClient } from '$lib/trpc';
import type { PromotionDetails } from '$quiz/student/application/interfaces/IEnrollQueries';

type Props = {
	promotion: PromotionDetails;
};

const REDIRECTION_DELAY_MS = 3000;

export class EnrollToPromotionVM {
	trpc: TRPCClient | null = null;
	authStep:
		| 'enter email'
		| 'searching student'
		| 'student found' // Showing OTP input
		| 'student not found'
		| 'enrolled' = $state('enter email');
	inputEmail: string = $state('');
	otp: string = $state('');
	promotion: PromotionDetails;
	redirectionTimeout: NodeJS.Timeout | null = null;

	constructor({ promotion }: Props) {
		this.promotion = promotion;
	}

	onJoinPromotion = async () => {
		this.authStep = 'searching student';
		this.trpc ??= createTRPC();
		const result = await this.trpc.student.tryLinkingStudent.mutate({
			email: this.inputEmail
		});
		if (result.success === false) {
			this.authStep = 'student not found';
			return;
		}
		this.authStep = 'student found';
	};

	onVerifyOtp = async () => {
		// Here would be the call to the backend to verify the OTP
		console.log('Verifying OTP:', this.otp);
		if (this.otp.length === 6) {
			this.authStep = 'enrolled';
		}

		this.trpc ??= createTRPC();
		const result = await this.trpc.student.enrollToPromotion.mutate({
			promotionId: this.promotion.id,
			email: this.inputEmail,
			otp: this.otp
		});

		if (!result.success) {
			this.authStep = 'student not found';
			return;
		}

		this.authStep = 'enrolled';
		this.redirectionTimeout = setTimeout(() => {
			this.redirectToLobby(this.promotion.id);
		}, REDIRECTION_DELAY_MS);
	};

	redirectToLobby = async (promotionId: string) => {
		await goto(resolve(`/students/promotion/${promotionId}/lobby`));
	};

	dispose() {
		if (this.redirectionTimeout) {
			clearTimeout(this.redirectionTimeout);
		}
	}
}
