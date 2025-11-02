import { Student } from '$quiz/domain/Student.entity';
import { StudentId } from '$quiz/domain/StudentId.valueObject';
import z from 'zod';

export const StudentDTOSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	lastName: z.string().optional(),
	email: z.email().optional()
});

export class CreateStudentDTO {
	constructor(
		public id: string,
		public name: string,
		public lastName?: string,
		public email?: string
	) {}
	static toDomain(dto: z.infer<typeof StudentDTOSchema>): Student {
		const { name, email, lastName, id } = dto;
		return Student.create({ email, name, lastName, id: new StudentId(id) });
	}
}
