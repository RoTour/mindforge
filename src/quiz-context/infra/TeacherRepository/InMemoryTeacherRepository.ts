// /Users/rotour/projects/mindforge/src/quiz-context/infra/TeacherRepository/InMemoryTeacherRepository.ts
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';
import type { Teacher } from '$quiz/domain/Teacher.entity';
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export class InMemoryTeacherRepository implements ITeacherRepository {
	private readonly teachers = new Map<string, Teacher>();

	async save(teacher: Teacher): Promise<void> {
		this.teachers.set(teacher.id.id(), teacher);
	}

	async findById(id: TeacherId | string): Promise<Teacher | null> {
		const teacherId = typeof id === 'string' ? id : id.id();
		return this.teachers.get(teacherId) ?? null;
	}

	async findByAuthUserId(authUserId: string): Promise<Teacher | null> {
		for (const teacher of this.teachers.values()) {
			if (teacher.authUserId === authUserId) {
				return teacher;
			}
		}
		return null;
	}

	async findAll(): Promise<Teacher[]> {
		return Array.from(this.teachers.values());
	}

	async clear(): Promise<void> {
		this.teachers.clear();
	}
}
