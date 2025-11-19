import { goto } from '$app/navigation';
import { createTRPC } from '$lib/trpc';

type UserDetails = {
	firstName: string;
	lastName: string;
	authId: string;
	email: string;
};

export class InviteVM {
	isLinking = $state(false);
	isCreating = $state(false);
	error = $state<string | null>(null);

	constructor(
		private userDetails: UserDetails,
		private promotionId: string
	) {}

	async linkStudent(studentId: string) {
		this.isLinking = true;
		this.error = null;
		const trpc = createTRPC();

		try {
			await trpc.student.linkStudentToUser.mutate({
				studentId,
				authId: this.userDetails.authId,
				email: this.userDetails.email
			});
			await this.onSuccess();
		} catch (e) {
			console.error(e);
			this.error = 'Failed to link student. Please try again.';
		} finally {
			this.isLinking = false;
		}
	}

	async createAndLinkStudent() {
		this.isCreating = true;
		this.error = null;
		const trpc = createTRPC();

		try {
			await trpc.student.createStudentAndLink.mutate({
				firstName: this.userDetails.firstName,
				lastName: this.userDetails.lastName,
				authId: this.userDetails.authId,
				email: this.userDetails.email,
				promotionId: this.promotionId
			});
			await this.onSuccess();
		} catch (e) {
			console.error(e);
			this.error = 'Failed to create and link student. Please try again.';
		} finally {
			this.isCreating = false;
		}
	}

	private async onSuccess() {
		// Redirect to promotion dashboard or show success message
		// For now, let's redirect to the promotion page
		await goto(`/teacher/promotions/${this.promotionId}`);
	}
}
