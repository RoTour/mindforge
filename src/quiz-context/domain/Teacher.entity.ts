// /Users/rotour/projects/mindforge/src/quiz-context/domain/Teacher.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { PromotionId } from './PromotionId.valueObject';
import { TeacherId } from './TeacherId.valueObject';

// The only required property to create a domain Teacher is the ID from the Auth context.
type CreateTeacherProps = {
	authUserId: string;
};

type TeacherProps = {
	id: TeacherId;
	authUserId: string;
	promotionIds: PromotionId[];
};

export class Teacher extends AggregateRoot<TeacherId> {
	public readonly authUserId: string; // Immutable reference to the Auth User
	public promotionIds: PromotionId[] = [];

	private constructor(id: TeacherId, props: { authUserId: string }) {
		super(id);
		this.authUserId = props.authUserId;
	}

	public static create(props: CreateTeacherProps): Teacher {
		const id = new TeacherId(); // Generate its own domain-specific ID
		return new Teacher(id, props);
	}

	public static rehydrate(props: TeacherProps): Teacher {
		const teacher = new Teacher(props.id, { authUserId: props.authUserId });
		teacher.promotionIds = props.promotionIds;
		return teacher;
	}

	public addPromotion(newPromotionId: PromotionId): void {
		if (!this.promotionIds.find((id) => id.equals(newPromotionId))) {
			this.promotionIds.push(newPromotionId);
		}
	}
}
