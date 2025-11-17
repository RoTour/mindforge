// @path: /Users/rotour/projects/mindforge/src/quiz-context/student/application/services/InMemoryEmailService.ts
import type { IEmailService } from '../interfaces/IEmailService';

export type SentEmail = {
	to: string;
	subject: string;
	body: string;
};

export class InMemoryEmailService implements IEmailService {
	public readonly sentEmails: SentEmail[] = [];

	async sendEmail(to: string, subject: string, body: string): Promise<void> {
		this.sentEmails.push({ to, subject, body });
		console.log(`In-memory email sent to ${to}`);
	}
}
