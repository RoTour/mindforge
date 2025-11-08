import type { IStudentRepository } from '../../domain/interfaces/IStudentRepository';
import type { Student } from '../../domain/Student.entity';

export class InMemoryStudentRepository implements IStudentRepository {
	private students: Map<string, Student> = new Map();

	async findAll(): Promise<Student[]> {
		return Array.from(this.students.values());
	}

	async findById(id: string): Promise<Student | null> {
		return this.students.get(id) || null;
	}

	async save(student: Student): Promise<void> {
		this.students.set(student.id.id(), student);
	}

	async saveMany(students: Student[]): Promise<void> {
		for (const student of students) {
			this.students.set(student.id.id(), student);
		}
	}
}
