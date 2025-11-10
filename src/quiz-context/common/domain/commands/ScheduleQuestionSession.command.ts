type ScheduleQuestionSessionCommandProps = {
	promotionId: string;
	questionId: string;
	startingOn?: Date;
	endingOn?: Date;
};
export class ScheduleQuestionSessionCommand {
	public static readonly type = 'ScheduleQuestionSessionCommand';
	public readonly promotionId: string;
	public readonly questionId: string;
	public readonly startingOn?: Date;
	public readonly endingOn?: Date;

	constructor(props: ScheduleQuestionSessionCommandProps) {
		this.promotionId = props.promotionId;
		this.questionId = props.questionId;
		this.startingOn = props.startingOn;
		this.endingOn = props.endingOn;
	}

	payload(): ScheduleQuestionSessionCommandProps {
		return {
			promotionId: this.promotionId,
			questionId: this.questionId,
			startingOn: this.startingOn,
			endingOn: this.endingOn
		};
	}
}
