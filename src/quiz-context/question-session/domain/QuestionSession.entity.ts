// src/quiz-context/domain/QuestionSession.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { QuestionSessionId } from './QuestionSessionId.valueObject';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { Answer, type AnswerProps } from './Answer.entity';
import {
	SessionHasEndedError,
	SessionIsNotActiveError,
	SessionIsNotPendingError,
	StudentAlreadyAnsweredError
} from './QuestionSession.errors';
import { StudentAnswerSubmitted } from './events/StudentAnswerSubmitted.event';

export type QuestionSessionStatus = 'PENDING' | 'ACTIVE' | 'CLOSED' | 'GRADING';

type QuestionSessionProps = {
	id: QuestionSessionId;
	questionId: QuestionId;
	promotionId: PromotionId;
	startedAt: Date;
	endsAt: Date;
	status: QuestionSessionStatus;
	answers: AnswerProps[];
};

export class QuestionSession extends AggregateRoot<QuestionSessionId> {
	public questionId: QuestionId;
	public promotionId: PromotionId;
	public startedAt: Date;
	public endsAt: Date;
	public status: QuestionSessionStatus;
	public answers: Answer[] = [];

	private constructor(
		id: QuestionSessionId,
		props: Omit<QuestionSessionProps, 'id' | 'answers' | 'status'>
	) {
		super(id);
		this.questionId = props.questionId;
		this.promotionId = props.promotionId;
		this.startedAt = props.startedAt;
		this.endsAt = props.endsAt;
		this.status = 'PENDING';
	}

	public static create(
		props: Omit<QuestionSessionProps, 'id' | 'answers' | 'status'>
	): QuestionSession {
		const id = new QuestionSessionId();
		const session = new QuestionSession(id, props);
		// Potentially add a domain event here
		return session;
	}

	public static rehydrate(props: QuestionSessionProps): QuestionSession {
		const session = new QuestionSession(props.id, props);
		session.status = props.status;
		session.answers = props.answers.map((p) => new Answer(p));
		return session;
	}

	public start() {
		if (this.status !== 'PENDING') {
			throw new SessionIsNotPendingError();
		}
		this.status = 'ACTIVE';
		this.startedAt = new Date();
	}

	public close() {
		if (this.status !== 'ACTIVE') {
			throw new SessionIsNotActiveError();
		}
		this.status = 'CLOSED';
	}

	public submitAnswer(answer: Answer) {
		if (this.status !== 'ACTIVE') {
			throw new SessionIsNotActiveError();
		}
		if (new Date() > this.endsAt) {
			this.status = 'CLOSED';
			throw new SessionHasEndedError();
		}
		const existingAnswer = this.answers.find((a) => a.studentId.equals(answer.studentId));
		if (existingAnswer) {
			throw new StudentAlreadyAnsweredError();
		}
		this.answers.push(answer);

		this.addDomainEvent(
			new StudentAnswerSubmitted(this.id.id(), answer.studentId.id(), answer.text)
		);
	}
}
