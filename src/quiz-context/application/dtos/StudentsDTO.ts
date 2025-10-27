import { Student } from '$quiz/domain/Student.entity';
import z from 'zod';

export const StudentDTOSchema = z.object({
	name: z.string().min(1),
	email: z.email().optional(),
	lastName: z.string().optional()
});

export class StudentDTO {
	static toDomain(dto: z.infer<typeof StudentDTOSchema>) {
		const { name, email, lastName } = dto;
		return Student.create({ email, name, lastName });
	}
}
