import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { EndingDateBeforeStartingDateError } from './PlannedQuestion.errors';

type PlannedQuestionStatus = 'PLANNED' | 'ENDED' | 'ONGOING' | 'NOT_DATE_DEFINED';

type PlannedQuestionProps = {
	status: PlannedQuestionStatus;
	startingOn?: Date;
	endingOn?: Date;
	questionId: QuestionId;
};

export class PlannedQuestion {
	status: PlannedQuestionStatus = 'NOT_DATE_DEFINED';
	startingOn?: Date;
	endingOn?: Date;
	questionId: QuestionId;

	private constructor(props: PlannedQuestionProps) {
		this.status = props.status;
		this.startingOn = props.startingOn;
		this.endingOn = props.endingOn;
		this.questionId = props.questionId;
	}

	public static create(props: Omit<PlannedQuestionProps, 'status'>): PlannedQuestion {
		const { questionId, startingOn, endingOn } = props;
		this.datesCheck(startingOn, endingOn);
		return new PlannedQuestion({
			questionId,
			status: this.determineStatus(startingOn, endingOn),
			startingOn,
			endingOn
		});
	}

	private static determineStatus(startingOn?: Date, endingOn?: Date): PlannedQuestionStatus {
		const now = new Date();
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
