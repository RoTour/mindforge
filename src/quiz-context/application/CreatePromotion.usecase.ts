// /Users/rotour/projects/mindforge/src/quiz-context/application/CreatePromotion.usecase.ts
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import type { IStudentRepository } from '$quiz/domain/interfaces/IStudentRepository';
import { Period } from '$quiz/domain/Period.valueObject';
import { Promotion } from '$quiz/domain/Promotion.entity';
import z from 'zod';
import { CreateStudentDTO, StudentDTOSchema } from './dtos/StudentDTO';
import { BadRequestError } from './errors/BadRequestError';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export const CreatePromotionCommandSchema = z.object({
	students: StudentDTOSchema.array(),
	name: z.string().min(1),
	baseYear: z.number().min(2000).max(2100),
	teacherId: z.instanceof(TeacherId)
});

export type CreatePromotionCommand = z.infer<typeof CreatePromotionCommandSchema>;

export class CreatePromotionUsecase {
	constructor(
		private readonly promotionRepository: IPromotionRepository,
		private readonly studentRepository: IStudentRepository
	) {}

	async execute(command: CreatePromotionCommand) {
		const parsedCommand = CreatePromotionCommandSchema.safeParse(command);
		if (!parsedCommand.success) {
			throw new BadRequestError(
				`Invalid command [${z.treeifyError(parsedCommand.error).errors.join(', ')}]`
			);
		}
		const { name, baseYear, students: studentDTOs, teacherId } = parsedCommand.data;

		// 1. Convert DTOs to Domain Entities
		const studentEntities = studentDTOs.map((dto) => CreateStudentDTO.toDomain(dto));

		// 2. Save the new students to the database
		await this.studentRepository.saveMany(studentEntities);

		// 3. Create the promotion
		const newPromotion = Promotion.create({
			name,
			period: new Period(baseYear),
			teacherId: teacherId
		});

		// 4. Add the IDs of the persistent students
		newPromotion.addStudents(studentEntities.map((s) => s.id));

		// 5. Save the promotion
		await this.promotionRepository.save(newPromotion);
	}
}
