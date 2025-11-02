// /Users/rotour/projects/mindforge/src/quiz-context/application/CreatePromotion.usecase.ts
import z from 'zod';
import { BadRequestError } from './errors/BadRequestError';
import { Period } from '$quiz/domain/Period.valueObject';
import { Promotion } from '$quiz/domain/Promotion.entity';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import { CreateStudentDTO, StudentDTOSchema } from './dtos/StudentDTO';
import type { IStudentRepository } from '$quiz/domain/interfaces/IStudentRepository';
import type { ITeacherRepository } from '$quiz/domain/interfaces/ITeacherRepository';
import { Teacher } from '$quiz/domain/Teacher.entity';

export const CreatePromotionCommandSchema = z.object({
	students: StudentDTOSchema.array(),
	name: z.string().min(1),
	baseYear: z.number().min(2000).max(2100),
	authUserId: z.string()
});

export type CreatePromotionCommand = z.infer<typeof CreatePromotionCommandSchema>;

export class CreatePromotionUsecase {
	constructor(
		private readonly promotionRepository: IPromotionRepository,
		private readonly studentRepository: IStudentRepository,
		private readonly teacherRepository: ITeacherRepository
	) {}

	async execute(command: CreatePromotionCommand) {
		const parsedCommand = CreatePromotionCommandSchema.safeParse(command);
		if (!parsedCommand.success) {
			throw new BadRequestError(
				`Invalid command [${z.treeifyError(parsedCommand.error).errors.join(', ')}]`
			);
		}
		const { name, baseYear, students: studentDTOs, authUserId } = parsedCommand.data;

		// 0. Find teacher from authUserId
		let teacher = await this.teacherRepository.findByAuthUserId(authUserId);
		if (!teacher) {
			// If teacher does not exist, create it.
			teacher = Teacher.create({ authUserId });
			await this.teacherRepository.save(teacher);
		}

		// 1. Convert DTOs to Domain Entities
		const studentEntities = studentDTOs.map((dto) => CreateStudentDTO.toDomain(dto));

		// 2. Save the new students to the database
		await this.studentRepository.saveMany(studentEntities);

		// 3. Create the promotion
		const newPromotion = Promotion.create({
			name,
			period: new Period(baseYear),
			teacherId: teacher.id
		});

		// 4. Add the IDs of the persistent students
		newPromotion.addStudents(studentEntities.map((s) => s.id));

		// 5. Save the promotion
		await this.promotionRepository.save(newPromotion);
	}
}
