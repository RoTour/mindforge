// /Users/rotour/projects/mindforge/src/quiz-context/promotion/domain/PlannedQuestion.entity.ts
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { EndingDateBeforeStartingDateError } from './PlannedQuestion.errors';
import { PlannedQuestionId } from './PlannedQuestionId.valueObject';

type PlannedQuestionStatus = 'PLANNED' | 'ENDED' | 'ONGOING' | 'NOT_DATE_DEFINED';

type PlannedQuestionProps = {
	id: PlannedQuestionId;
	questionId: QuestionId;
	startingOn?: Date;
	endingOn?: Date;
};

export class PlannedQuestion {
	public readonly id: PlannedQuestionId;
	public startingOn?: Date;
	public endingOn?: Date;
	public readonly questionId: QuestionId;

	private constructor(props: PlannedQuestionProps) {
		this.id = props.id;
		this.questionId = props.questionId;
		this.startingOn = props.startingOn;
		this.endingOn = props.endingOn;
	}

	public static create(props: Omit<PlannedQuestionProps, 'id'>): PlannedQuestion {
		const id = new PlannedQuestionId();
		PlannedQuestion.datesCheck(props.startingOn, props.endingOn);
		return new PlannedQuestion({ ...props, id });
	}

	public static rehydrate(props: PlannedQuestionProps): PlannedQuestion {
		return new PlannedQuestion(props);
	}

	public changeSchedule(startingOn?: Date, endingOn?: Date): void {
		PlannedQuestion.datesCheck(startingOn, endingOn);
		this.startingOn = startingOn;
		this.endingOn = endingOn;
	}

	public get status(): PlannedQuestionStatus {
		const now = new Date();
		const { startingOn, endingOn } = this;

		if (startingOn && endingOn) {
			if (now < startingOn) return 'PLANNED';
			if (now >= startingOn && now <= endingOn) return 'ONGOING';
			if (now > endingOn) return 'ENDED';
		}
		return 'NOT_DATE_DEFINED';
	}

	private static datesCheck(startingOn?: Date, endingOn?: Date): void {
		if (startingOn && endingOn && endingOn < startingOn) {
			throw new EndingDateBeforeStartingDateError();
		}
	}
}
