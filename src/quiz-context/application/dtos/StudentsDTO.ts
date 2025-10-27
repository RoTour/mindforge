import { Student } from '$quiz/domain/Student.entity';
import { StudentId } from '$quiz/domain/StudentId.valueObject';
import z from 'zod';

export const StudentDTOSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	lastName: z.string().min(1)
});

export class StudentDTO {
	static toDomain(dto: z.infer<typeof StudentDTOSchema>) {
		const { name, email, lastName } = dto;
		return Student.create(new StudentId(), email, name, lastName);
	}
}
