// @path: src/routes/students/enroll/[promotionId]/EnrollToPromotionVM.svelte.ts
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { createTRPC, type TRPCClient } from '$lib/trpc';
import type { PromotionDetails } from '$quiz/student/application/interfaces/IEnrollQueries';
import qrcode from 'qrcode-generator';

type Props = {
	promotion: PromotionDetails;
	pageOrigin: string;
	authId: string;
};

const REDIRECTION_DELAY_MS = 3000;

export class EnrollToPromotionVM {
	trpc: TRPCClient | null = null;
	authStep:
		| 'enter email'
		| 'searching student'
		| 'student found' // Showing OTP input
		| 'student not found'
		| 'manual verification'
		| 'wait for teacher approval'
		| 'enrolled' = $state('enter email');
	inputEmail: string = $state('');
	inputFirstName: string = $state('');
	inputLastName: string = $state('');
	otp: string = $state('');
	promotion: PromotionDetails;
	redirectionTimeout: NodeJS.Timeout | null = null;
	qrCodeSvg: string | null = $state(null);
	pageOrigin: string;
	authId: string;
	qrCodeUrl: string | null = $state(null);
	isUrlCopied: boolean = $state(false);

	constructor({ promotion, pageOrigin, authId }: Props) {
		this.promotion = promotion;
		this.pageOrigin = pageOrigin;
		this.authId = authId;
	}

	// Step 1: User inputs email and clicks "Join"
	onJoinPromotion = async () => {
		this.authStep = 'searching student';
		this.trpc ??= createTRPC();
		const result = await this.trpc.student.tryLinkingStudent.mutate({
			email: this.inputEmail
		});

		// Student not found, Should ask for firstname/lastname
		if (result.success === false) {
			this.authStep = 'student not found';
			return;
		}

		// Student found, OTP has been sent
		this.authStep = 'student found';
	};

	onEnterName = () => {
		if (!this.inputFirstName || !this.inputLastName) {
			// TODO: Show an error to the user
			return;
		}
		this.authStep = 'manual verification';
		this._generateQrCode();
	};

	copyQrCodeUrl = async () => {
		if (!this.qrCodeUrl) return;
		try {
			await navigator.clipboard.writeText(this.qrCodeUrl);
			this.isUrlCopied = true;
			setTimeout(() => {
				this.isUrlCopied = false;
			}, 2000); // Reset after 2 seconds
		} catch (err) {
			console.error('Failed to copy: ', err);
			// Maybe show an error to the user
		}
	};

	private _generateQrCode = () => {
		const payload = {
			firstName: this.inputFirstName,
			lastName: this.inputLastName,
			email: this.inputEmail,
			promotionId: this.promotion.id,
			authId: this.authId
		};
		const jsonPayload = JSON.stringify(payload);
		const b64Payload = btoa(jsonPayload);

		const url = `${this.pageOrigin}/teacher/promotions/${this.promotion.id}/invite?payload=${b64Payload}`;
		this.qrCodeUrl = url;

		const qr = qrcode(0, 'L');
		qr.addData(url);
		qr.make();
		this.qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 4 });
	};

	onVerifyOtp = async () => {
		console.debug('Verifying OTP:', this.otp);

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

	backToEmailStep = () => {
		this.authStep = 'enter email';
		this.inputFirstName = '';
		this.inputLastName = '';
		this.otp = '';
	};

	dispose() {
		if (this.redirectionTimeout) {
			clearTimeout(this.redirectionTimeout);
		}
	}
}
