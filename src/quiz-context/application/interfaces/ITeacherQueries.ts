import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export interface ITeacherQueries {
	findByAuthUserId: (authUserId: string) => Promise<{ id: TeacherId } | null>;
}
