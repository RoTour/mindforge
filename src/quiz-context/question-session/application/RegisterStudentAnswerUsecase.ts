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
		// In a full DDD setup, we'd use an EventBus. Injecting specific listener for simplicity/pragmatism here.
		private readonly scheduleAutoGradingListener: IDomainEventListener
	) {}

	async execute(command: RegisterStudentAnswerCommand): Promise<void> {
		console.log('RegisterStudentAnswerUsecase executing', command);
		const session = await this.questionSessionRepository.findById(
			new QuestionSessionId(command.questionSessionId)
		);
		if (!session) {
			console.error('QuestionSession not found in RegisterStudentAnswerUsecase', { command });
			return;
		}

		const answer = new Answer({
			studentId: new StudentId(command.studentId),
			text: command.answerText,
			submittedAt: new Date()
		});

		try {
			session.submitAnswer(answer);
		} catch (e) {
			console.warn('Error submitting answer in RegisterStudentAnswerUsecase', {
				message: (e as Error).message,
				command
			});
			return;
		}
		DomainEventPublisher.subscribe(this.scheduleAutoGradingListener);

		await this.questionSessionRepository.save(session);

		// Publish domain events
		await Promise.all(session.getDomainEvents().map((e) => DomainEventPublisher.publish(e)));
		session.clearDomainEvents();
	}
}
