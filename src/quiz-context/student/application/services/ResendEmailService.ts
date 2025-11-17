// @path: /Users/rotour/projects/mindforge/src/quiz-context/student/application/services/ResendEmailService.ts
import type { Resend } from 'resend';
import type { IEmailService } from '../interfaces/IEmailService';

export class ResendEmailService implements IEmailService {
	constructor(
		private readonly resend: Resend,
		private readonly from: string
	) {}

	async sendEmail(to: string, subject: string, body: string): Promise<void> {
		await this.resend.emails.send({
			from: this.from,
			to: to,
			subject: subject,
			html: body
		});
	}
}
