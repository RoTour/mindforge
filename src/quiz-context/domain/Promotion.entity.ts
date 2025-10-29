import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { Period } from './Period.valueObject';
import { PromotionId } from './PromotionId.valueObject';
import { StudentId } from './StudentId.valueObject';
import type { TeacherId } from './TeacherId.valueObject';

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
}
