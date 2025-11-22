// src/quiz-context/domain/QuestionSession.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Answer, type AnswerProps } from './Answer.entity';
import type { Grade } from './Grade.valueObject';
import {
	SessionHasEndedError,
	SessionIsNotActiveError,
	SessionIsNotPendingError,
	StudentAlreadyAnsweredError
} from './QuestionSession.errors';
import { QuestionSessionId } from './QuestionSessionId.valueObject';
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

	public getAnswerFromStudent(studentId: StudentId): Answer | undefined {
		return this.answers.find((a) => a.studentId.equals(studentId));
	}

	public autoGradeAnswer(studentId: StudentId, grade: Grade) {
		const answer = this.answers.find((a) => a.studentId.equals(studentId));
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.assignAutoGrade(grade);
		// We could emit an event here if needed, e.g. AnswerAutoGraded
	}

	public teacherGradeAnswer(studentId: StudentId, grade: Grade) {
		const answer = this.answers.find((a) => a.studentId.equals(studentId));
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.assignTeacherGrade(grade);
	}

	public publishGrade(studentId: StudentId) {
		const answer = this.answers.find((a) => a.studentId.equals(studentId));
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.publishGrade();
	}

	public unpublishGrade(studentId: StudentId) {
		const answer = this.answers.find((a) => a.studentId.equals(studentId));
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.unpublishGrade();
	}
}
