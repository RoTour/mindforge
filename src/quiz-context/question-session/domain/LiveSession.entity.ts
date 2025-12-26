// src/quiz-context/question-session/domain/LiveSession.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { Answer } from './Answer.entity';
import type { Grade } from './Grade.valueObject';
import {
    SessionHasEndedError,
    SessionIsNotActiveError,
    SessionIsNotPendingError
} from './LiveSession.errors';
import { LiveSessionId } from './LiveSessionId.valueObject';
import { QuestionSlot, type QuestionSlotProps } from './QuestionSlot.entity';
import { SlotNotFoundError } from './QuestionSlot.errors';
import { QuestionSlotUnlocked } from './events/QuestionSlotUnlocked.event';
import { StudentAnswerSubmitted } from './events/StudentAnswerSubmitted.event';

export type LiveSessionStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';

type LiveSessionProps = {
	id: LiveSessionId;
	promotionId: PromotionId;
	scheduledDate: Date;
	endsAt: Date;
	status: LiveSessionStatus;
	lockPreviousOnUnlock: boolean;
	slots: QuestionSlotProps[];
};

export class LiveSession extends AggregateRoot<LiveSessionId> {
	public promotionId: PromotionId;
	public scheduledDate: Date;
	public endsAt: Date;
	public status: LiveSessionStatus;
	public lockPreviousOnUnlock: boolean;
	public slots: QuestionSlot[] = [];

	private constructor(
		id: LiveSessionId,
		props: Omit<LiveSessionProps, 'id' | 'slots' | 'status'>
	) {
		super(id);
		this.promotionId = props.promotionId;
		this.scheduledDate = props.scheduledDate;
		this.endsAt = props.endsAt;
		this.lockPreviousOnUnlock = props.lockPreviousOnUnlock;
		this.status = 'PENDING';
	}

	public static create(props: {
		promotionId: PromotionId;
		scheduledDate: Date;
		endsAt: Date;
		lockPreviousOnUnlock?: boolean;
		questionIds: QuestionId[];
		id?: LiveSessionId;
	}): LiveSession {
		const id = props.id ?? new LiveSessionId();
		const session = new LiveSession(id, {
			promotionId: props.promotionId,
			scheduledDate: props.scheduledDate,
			endsAt: props.endsAt,
			lockPreviousOnUnlock: props.lockPreviousOnUnlock ?? false
		});

		// Create slots from question IDs with order
		session.slots = props.questionIds.map((questionId, index) =>
			QuestionSlot.create({
				questionId,
				order: index + 1 // 1-indexed order
			})
		);

		return session;
	}

	public static rehydrate(props: LiveSessionProps): LiveSession {
		const session = new LiveSession(props.id, {
			promotionId: props.promotionId,
			scheduledDate: props.scheduledDate,
			endsAt: props.endsAt,
			lockPreviousOnUnlock: props.lockPreviousOnUnlock
		});
		session.status = props.status;
		session.slots = props.slots.map((p) => QuestionSlot.rehydrate(p));
		return session;
	}

	public start(): void {
		if (this.status !== 'PENDING') {
			throw new SessionIsNotPendingError();
		}
		this.status = 'ACTIVE';
	}

	public close(): void {
		if (this.status !== 'ACTIVE') {
			throw new SessionIsNotActiveError();
		}
		this.status = 'CLOSED';
		// Close all slots
		this.slots.forEach((slot) => {
			if (slot.status === 'UNLOCKED') {
				slot.close();
			}
		});
	}

	public addQuestion(questionId: QuestionId): void {
		if (this.status !== 'PENDING') {
			throw new SessionIsNotPendingError();
		}
		const nextOrder = this.slots.length + 1;
		const newSlot = QuestionSlot.create({
			questionId,
			order: nextOrder
		});
		this.slots.push(newSlot);
	}

	public removeQuestion(slotOrder: number): void {
		if (this.status !== 'PENDING') {
			throw new SessionIsNotPendingError();
		}
		const slotIndex = this.slots.findIndex((s) => s.order === slotOrder);
		if (slotIndex === -1) {
			throw new SlotNotFoundError();
		}
		this.slots.splice(slotIndex, 1);
		// Reindex remaining slots
		this.slots.forEach((slot, index) => {
			slot.order = index + 1;
		});
	}

	public reorderQuestions(newOrder: number[]): void {
		if (this.status !== 'PENDING') {
			throw new SessionIsNotPendingError();
		}
		if (newOrder.length !== this.slots.length) {
			throw new Error('New order must contain all slots');
		}
		// Create a map of current slots by order
		const slotMap = new Map(this.slots.map((s) => [s.order, s]));
		// Reorder based on newOrder array
		this.slots = newOrder.map((oldOrder, newIndex) => {
			const slot = slotMap.get(oldOrder);
			if (!slot) {
				throw new SlotNotFoundError();
			}
			slot.order = newIndex + 1;
			return slot;
		});
	}

	public unlockSlot(order: number): void {
		if (this.status !== 'ACTIVE') {
			throw new SessionIsNotActiveError();
		}

		const slot = this.slots.find((s) => s.order === order);
		if (!slot) {
			throw new SlotNotFoundError();
		}

		// Optionally close previous slots
		if (this.lockPreviousOnUnlock) {
			this.slots.forEach((s) => {
				if (s.order < order && s.status === 'UNLOCKED') {
					s.close();
				}
			});
		}

		slot.unlock();

		this.addDomainEvent(
			new QuestionSlotUnlocked(this.id.id(), slot.id.id(), order)
		);
	}

	public submitAnswer(slotOrder: number, answer: Answer): void {
		if (this.status !== 'ACTIVE') {
			throw new SessionIsNotActiveError();
		}
		if (new Date() > this.endsAt) {
			this.status = 'CLOSED';
			throw new SessionHasEndedError();
		}

		const slot = this.slots.find((s) => s.order === slotOrder);
		if (!slot) {
			throw new SlotNotFoundError();
		}

		slot.submitAnswer(answer);

		this.addDomainEvent(
			new StudentAnswerSubmitted(this.id.id(), slotOrder, answer.studentId.id(), answer.text)
		);
	}

	public getSlotByOrder(order: number): QuestionSlot | undefined {
		return this.slots.find((s) => s.order === order);
	}

	public getCurrentUnlockedSlot(): QuestionSlot | undefined {
		return this.slots.find((s) => s.status === 'UNLOCKED');
	}

	public getAnswerFromStudent(slotOrder: number, studentId: StudentId): Answer | undefined {
		const slot = this.slots.find((s) => s.order === slotOrder);
		return slot?.getAnswerFromStudent(studentId);
	}

	public autoGradeAnswer(slotOrder: number, studentId: StudentId, grade: Grade): void {
		const slot = this.slots.find((s) => s.order === slotOrder);
		if (!slot) {
			throw new SlotNotFoundError();
		}
		const answer = slot.getAnswerFromStudent(studentId);
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.assignAutoGrade(grade);
	}

	public teacherGradeAnswer(slotOrder: number, studentId: StudentId, grade: Grade): void {
		const slot = this.slots.find((s) => s.order === slotOrder);
		if (!slot) {
			throw new SlotNotFoundError();
		}
		const answer = slot.getAnswerFromStudent(studentId);
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.assignTeacherGrade(grade);
	}

	public publishGrade(slotOrder: number, studentId: StudentId): void {
		const slot = this.slots.find((s) => s.order === slotOrder);
		if (!slot) {
			throw new SlotNotFoundError();
		}
		const answer = slot.getAnswerFromStudent(studentId);
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.publishGrade();
	}

	public unpublishGrade(slotOrder: number, studentId: StudentId): void {
		const slot = this.slots.find((s) => s.order === slotOrder);
		if (!slot) {
			throw new SlotNotFoundError();
		}
		const answer = slot.getAnswerFromStudent(studentId);
		if (!answer) {
			throw new Error('Answer not found');
		}
		answer.unpublishGrade();
	}
}
