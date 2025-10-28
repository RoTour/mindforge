import z from 'zod';
import { BadRequestError } from './errors/BadRequestError';
import { Period } from '$quiz/domain/Period.valueObject';
import { Promotion } from '$quiz/domain/Promotion.entity';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import { StudentDTO, StudentDTOSchema } from './dtos/StudentDTO';
import type { IStudentRepository } from '$quiz/domain/interfaces/IStudentRepository';

export const CreatePromotionCommandSchema = z.object({
	students: StudentDTOSchema.array(),
	name: z.string().min(1),
	baseYear: z.number().min(2000).max(2100)
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
		const { name, baseYear, students: studentDTOs } = parsedCommand.data;

		// 1. Convert DTOs to Domain Entities
		const studentEntities = studentDTOs.map((dto) => StudentDTO.toDomain(dto));

		// 2. Save the new students to the database
		await this.studentRepository.saveMany(studentEntities);

		// 3. Create the promotion
		const newPromotion = Promotion.create(name, new Period(baseYear));

		// 4. Add the IDs of the persistent students
		newPromotion.addStudents(studentEntities.map((s) => s.id));

		// 5. Save the promotion
		await this.promotionRepository.save(newPromotion);
	}
}
