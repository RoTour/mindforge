import type { Student } from '../Student.entity';

export interface IStudentRepository {
	save(student: Student): Promise<void>;
	saveMany(students: Student[]): Promise<void>;
	findById(id: string): Promise<Student | null>;
	findAll(): Promise<Student[]>;
}
