import type { TeacherId } from '../../domain/TeacherId.valueObject';

export interface ITeacherQueries {
	findByAuthUserId: (authUserId: string) => Promise<{ id: TeacherId } | null>;
}
