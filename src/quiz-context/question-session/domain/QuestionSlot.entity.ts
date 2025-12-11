// src/quiz-context/question-session/domain/QuestionSlot.entity.ts
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Answer, type AnswerProps } from './Answer.entity';
import { SlotIsNotUnlockedError, StudentAlreadyAnsweredError } from './QuestionSlot.errors';
import { QuestionSlotId } from './QuestionSlotId.valueObject';

export type QuestionSlotStatus = 'LOCKED' | 'UNLOCKED' | 'CLOSED';

export type QuestionSlotProps = {
	id: QuestionSlotId;
	questionId: QuestionId;
	order: number;
	status: QuestionSlotStatus;
	answers: AnswerProps[];
};

export class QuestionSlot {
	public readonly id: QuestionSlotId;
	public readonly questionId: QuestionId;
	public readonly order: number;
	public status: QuestionSlotStatus;
	public answers: Answer[] = [];

	private constructor(props: Omit<QuestionSlotProps, 'answers' | 'status'>) {
		this.id = props.id;
		this.questionId = props.questionId;
		this.order = props.order;
		this.status = 'LOCKED';
	}

	public static create(props: {
		questionId: QuestionId;
		order: number;
		id?: QuestionSlotId;
	}): QuestionSlot {
		const id = props.id ?? new QuestionSlotId();
		return new QuestionSlot({
			id,
			questionId: props.questionId,
			order: props.order
		});
	}

	public static rehydrate(props: QuestionSlotProps): QuestionSlot {
		const slot = new QuestionSlot({
			id: props.id,
			questionId: props.questionId,
			order: props.order
		});
		slot.status = props.status;
		slot.answers = props.answers.map((p) => new Answer(p));
		return slot;
	}

	public unlock(): void {
		this.status = 'UNLOCKED';
	}

	public close(): void {
		this.status = 'CLOSED';
	}

	public submitAnswer(answer: Answer): void {
		if (this.status !== 'UNLOCKED') {
			throw new SlotIsNotUnlockedError();
		}
		const existingAnswer = this.answers.find((a) => a.studentId.equals(answer.studentId));
		if (existingAnswer) {
			throw new StudentAlreadyAnsweredError();
		}
		this.answers.push(answer);
	}

	public getAnswerFromStudent(studentId: StudentId): Answer | undefined {
		return this.answers.find((a) => a.studentId.equals(studentId));
	}

	public hasStudentAnswered(studentId: StudentId): boolean {
		return this.answers.some((a) => a.studentId.equals(studentId));
	}
}
