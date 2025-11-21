import { DomainEventPublisher } from '$ddd/events/DomainEventPublisher';
import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Answer } from '../domain/Answer.entity';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';

export type RegisterStudentAnswerCommand = {
	questionSessionId: string;
	studentId: string;
	answerText: string;
};

// Called by message queue consumer to register student answers without concurrency issues
export class RegisterStudentAnswerUsecase {
	constructor(
		private readonly questionSessionRepository: IQuestionSessionRepository,
		private readonly scheduleAutoGradingListener: IDomainEventListener
	) {}

	async execute(command: RegisterStudentAnswerCommand): Promise<void> {
		const session = await this.questionSessionRepository.findById(
			new QuestionSessionId(command.questionSessionId)
		);

		if (!session) {
			console.error('QuestionSession not found in RegisterStudentAnswerUsecase', { command });
			return;
		}

		DomainEventPublisher.subscribe(this.scheduleAutoGradingListener);

		try {
			const answer = new Answer({
				studentId: new StudentId(command.studentId),
				text: command.answerText,
				submittedAt: new Date(),
				isPublished: false
			});

			session.submitAnswer(answer);

			await this.questionSessionRepository.save(session);

			// Manually publish events
			const events = session.getDomainEvents();
			await Promise.all(events.map((event) => DomainEventPublisher.publish(event)));
			session.clearDomainEvents();
		} catch (e) {
			console.warn('Error submitting answer in RegisterStudentAnswerUsecase', {
				message: (e as Error).message,
				command
			});
			throw e;
		} finally {
			DomainEventPublisher.unsubscribe(this.scheduleAutoGradingListener);
		}
	}
}
