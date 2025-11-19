import { PromotionNotFoundError } from '$quiz/promotion/application/errors';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';

export type CreateStudentAndLinkCommand = {
	firstName: string;
	lastName: string;
	authId: string;
	email: string;
	promotionId: string;
};

export class CreateStudentAndLinkUsecase {
	constructor(
		private studentRepository: IStudentRepository,
		private promotionRepository: IPromotionRepository
	) {}

	async execute(command: CreateStudentAndLinkCommand): Promise<void> {
		const { firstName, lastName, authId, email, promotionId } = command;

		// 1. Create Student
		const student = Student.create({
			id: new StudentId(),
			name: firstName,
			lastName: lastName,
			email: email,
			authId: authId
		});

		await this.studentRepository.save(student);

		// 2. Link to Promotion
		const promotion = await this.promotionRepository.findById(promotionId);
		if (!promotion) {
			throw new PromotionNotFoundError(promotionId);
		}

		promotion.addStudents([student.id]);
		await this.promotionRepository.save(promotion);
	}
}
