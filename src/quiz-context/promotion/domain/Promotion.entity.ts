import { DomainEventPublisher } from '$ddd/events/DomainEventPublisher';
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import { PromotionQuestionPlanned } from './events/PromotionQuestionPlanned.event';
import { PlannedQuestion } from './PlannedQuestion.valueObject';

type CreatePromotionProps = {
	name: string;
	period: Period;
	teacherId: TeacherId;
};

export class Promotion extends AggregateRoot<PromotionId> {
	public name: string;
	public period: Period;
	public readonly teacherId: TeacherId; // The teacher who owns this promotion
	public studentIds: StudentId[] = [];
	public plannedQuestions: PlannedQuestion[] = [];

	private constructor(id: PromotionId, props: CreatePromotionProps) {
		super(id);
		this.name = props.name;
		this.period = props.period;
		this.teacherId = props.teacherId;
	}

	public static create(props: CreatePromotionProps): Promotion {
		const id = new PromotionId();
		return new Promotion(id, props);
	}

	public static rehydrate(props: {
		id: PromotionId;
		name: string;
		period: Period;
		teacherId: TeacherId;
		studentIds: StudentId[];
	}): Promotion {
		const promotion = new Promotion(props.id, {
			name: props.name,
			period: props.period,
			teacherId: props.teacherId
		});
		promotion.studentIds = props.studentIds;
		return promotion;
	}

	public addStudents(newStudentIds: StudentId[]) {
		const allIds = [...this.studentIds.map((it) => it.id()), ...newStudentIds.map((it) => it.id())];
		const deduplicatedIds = Array.from(new Set(allIds)).map((id) => new StudentId(id));
		this.studentIds = deduplicatedIds;
	}

	public planQuestion(questionId: QuestionId, startingOn?: Date, endingOn?: Date) {
		const plannedQuestion: PlannedQuestion = PlannedQuestion.create({
			questionId,
			startingOn,
			endingOn
		});

		this.plannedQuestions.push(plannedQuestion);

		if (startingOn) {
			DomainEventPublisher.publish(
				new PromotionQuestionPlanned(this.id.id(), questionId.id(), startingOn)
			);
		}
	}
}
