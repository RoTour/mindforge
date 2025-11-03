// /Users/rotour/projects/mindforge/src/quiz-context/domain/interfaces/ITeacherRepository.ts
import type { Teacher } from '../Teacher.entity';
import type { TeacherId } from '../TeacherId.valueObject';

export interface ITeacherRepository {
	save(teacher: Teacher): Promise<void>;
	findById(id: TeacherId | string): Promise<Teacher | null>;
	findAll(): Promise<Teacher[]>;
}
