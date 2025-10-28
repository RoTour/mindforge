import z from 'zod';
import { BadRequestError } from './errors/BadRequestError';
import { Period } from '$quiz/domain/Period.valueObject';
import { Promotion } from '$quiz/domain/Promotion.entity';
import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import { StudentDTO, StudentDTOSchema } from './dtos/StudentDTO';

const CreatePromotionCommandSchema = z.object({
	students: StudentDTOSchema.array(),
	name: z.string().min(1),
	baseYear: z.number().min(2000).max(2100)
});

type CreatePromotionCommand = z.infer<typeof CreatePromotionCommandSchema>;

export class CreatePromotionUsecase {
	constructor(private readonly promotionRepository: IPromotionRepository) {}

	async execute(command: CreatePromotionCommand) {
		const parsedCommand = CreatePromotionCommandSchema.safeParse(command);
		if (!parsedCommand.success) {
			throw new BadRequestError(
				`Invalid command [${z.treeifyError(parsedCommand.error).errors.join(', ')}]`
			);
		}
		const { name, baseYear, students } = parsedCommand.data;

		const newPromotion = Promotion.create(name, new Period(baseYear));
		newPromotion.addStudents(students.map((s) => StudentDTO.toDomain(s).id));

		await this.promotionRepository.save(newPromotion);
	}
}
