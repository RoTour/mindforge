import type { Period } from '$quiz/domain/Period.valueObject';
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export type TeacherPromotionsListItem = {
	id: string;
	name: string;
	period: Period;
};

export interface ITeacherPromotionsQueries {
	listTeacherPromotions: (teacherId: TeacherId) => Promise<TeacherPromotionsListItem[]>;
}
