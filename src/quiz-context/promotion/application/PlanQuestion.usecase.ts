import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import z from 'zod';
import type { IPromotionRepository } from '../domain/interfaces/IPromotionRepository';

export const PlanQuestionSchema = z.object({
	promotionId: z.string(),
	questionId: z.string(),
	startingOn: z.coerce.date().optional(),
	endingOn: z.coerce.date().optional()
});

type PlanQuestionCommand = z.infer<typeof PlanQuestionSchema>;

export class PlanQuestionUsecase {
	constructor(
		private readonly promotionRepository: IPromotionRepository,
		private readonly questionRepository: IQuestionRepository
	) {}

	async execute(command: PlanQuestionCommand) {
		const { promotionId, questionId, startingOn, endingOn } = command;

		const question = await this.questionRepository.findById(new QuestionId(command.questionId));
		if (!question) {
			throw new NotFoundError(`Question with ID ${questionId} not found`);
		}

		const promotion = await this.promotionRepository.findById(promotionId);
		if (!promotion) {
			throw new NotFoundError(`Promotion with ID ${promotionId} not found`);
		}

		promotion.planQuestion(question.id, startingOn, endingOn);

		await this.promotionRepository.save(promotion);
	}
}
