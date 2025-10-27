import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import type { Period } from './Period.valueObject';
import { PromotionId } from './PromotionId.valueObject';
import { StudentId } from './StudentId.valueObject';

export class Promotion extends AggregateRoot<PromotionId> {
	name: string;
	period: Period;
	studentIds: StudentId[] = [];

	private constructor(id: PromotionId, name: string, period: Period) {
		super(id);
		this.name = name;
		this.period = period;
	}

	static create(name: string, period: Period) {
		const id = new PromotionId();
		return new Promotion(id, name, period);
	}

	public addStudents(newStudentIds: StudentId[]) {
		const allIds = [...this.studentIds.map((it) => it.id()), ...newStudentIds.map((it) => it.id())];
		const deduplicatedIds = Array.from(new Set(allIds)).map((id) => new StudentId(id));
		this.studentIds = deduplicatedIds;
	}
}
