import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import { PromotionQuestionPlanned } from './events/PromotionQuestionPlanned.event';
import { PlannedQuestion } from './PlannedQuestion.entity';
import type { PlannedQuestionId } from './PlannedQuestionId.valueObject';
import { Period } from './Period.valueObject';
import { PromotionId } from './PromotionId.valueObject';
import { DomainEventPublisher } from '$ddd/events/DomainEventPublisher';

type CreatePromotionProps = {
	name: string;
	period: Period;
	teacherId: TeacherId;
	plannedQuestions?: PlannedQuestion[];
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
		this.plannedQuestions = props.plannedQuestions ?? [];
	}

	public static create(props: Omit<CreatePromotionProps, 'plannedQuestions'>): Promotion {
		const id = new PromotionId();
		return new Promotion(id, { ...props, plannedQuestions: [] });
	}

	public static rehydrate(props: {
		id: PromotionId;
		name: string;
		period: Period;
		teacherId: TeacherId;
		studentIds: StudentId[];
		plannedQuestions: PlannedQuestion[];
	}): Promotion {
		const promotion = new Promotion(props.id, {
			name: props.name,
			period: props.period,
			teacherId: props.teacherId,
			plannedQuestions: props.plannedQuestions
		});
		promotion.studentIds = props.studentIds;
		return promotion;
	}

	public addStudents(newStudentIds: StudentId[]) {
		const allIds = [...this.studentIds.map((it) => it.id()), ...newStudentIds.map((it) => it.id())];
		const deduplicatedIds = Array.from(new Set(allIds)).map((id) => new StudentId(id));
		this.studentIds = deduplicatedIds;
	}

	public planQuestion(questionId: QuestionId, startingOn?: Date, endingOn?: Date): void {
		const newPlan = PlannedQuestion.create({
			questionId,
			startingOn,
			endingOn
		});
		this.plannedQuestions.push(newPlan);

		if (startingOn) {
			DomainEventPublisher.publish(
				new PromotionQuestionPlanned(this.id.id(), newPlan.id.id(), startingOn, endingOn)
			);
		}
	}

	public updatePlannedQuestionSchedule(
		plannedQuestionId: PlannedQuestionId,
		startingOn?: Date,
		endingOn?: Date
	): void {
		const planToUpdate = this.plannedQuestions.find((p) => p.id.equals(plannedQuestionId));
		if (!planToUpdate) {
			// Or throw an error
			return;
		}
		planToUpdate.changeSchedule(startingOn, endingOn);

		// Optionally, publish an update event
	}

	public unplanQuestion(plannedQuestionId: PlannedQuestionId): void {
		this.plannedQuestions = this.plannedQuestions.filter((p) => !p.id.equals(plannedQuestionId));
		// Optionally, publish a deletion event
	}
}
