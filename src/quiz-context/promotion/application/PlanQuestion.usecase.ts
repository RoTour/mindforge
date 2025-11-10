import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import z from 'zod';
import type { IPromotionRepository } from '../domain/interfaces/IPromotionRepository';
import { PlannedQuestionId } from '../domain/PlannedQuestionId.valueObject';
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';

export const PlanQuestionSchema = z.object({
	id: z.string().optional(),
	promotionId: z.string(),
	questionId: z.string(),
	startingOn: z.coerce.date().optional(),
	endingOn: z.coerce.date().optional()
});

export type PlanQuestionCommand = z.infer<typeof PlanQuestionSchema>;

export class PlanQuestionUsecase {
	constructor(
		private readonly promotionRepository: IPromotionRepository,
		private readonly questionRepository: IQuestionRepository,
		private readonly scheduleSessionListener: IDomainEventListener
	) {}

	async execute(command: PlanQuestionCommand) {
		const { id, promotionId, questionId, startingOn, endingOn } = command;

		DomainEventPublisher.subscribe(this.scheduleSessionListener);

		try {
			const question = await this.questionRepository.findById(new QuestionId(command.questionId));
			if (!question) {
				throw new NotFoundError(`Question with ID ${questionId} not found`);
			}

			const promotion = await this.promotionRepository.findById(promotionId);
			if (!promotion) {
				throw new NotFoundError(`Promotion with ID ${promotionId} not found`);
			}

			const updatingExistingPlannedQuestion = !!id;
			if (updatingExistingPlannedQuestion) {
				promotion.updatePlannedQuestionSchedule(new PlannedQuestionId(id), startingOn, endingOn);
				await this.promotionRepository.save(promotion);
				return;
			}

			promotion.planQuestion(question.id, startingOn, endingOn);
			await this.promotionRepository.save(promotion);

			await Promise.all(promotion.getDomainEvents().map((e) => DomainEventPublisher.publish(e)));
			promotion.clearDomainEvents();
		} finally {
			DomainEventPublisher.unsubscribe(this.scheduleSessionListener);
		}
	}
}
