import { DomainEventPublisher } from '$ddd/events/DomainEventPublisher';
import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';
import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import z from 'zod';
import type { IPromotionRepository } from '../domain/interfaces/IPromotionRepository';
import { PlannedQuestionId } from '../domain/PlannedQuestionId.valueObject';

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

	async execute(command: PlanQuestionCommand): Promise<void> {
		const { id, promotionId, questionId, startingOn, endingOn } = command;

		const promotion = await this.promotionRepository.findById(promotionId);
		if (!promotion) {
			throw new NotFoundError(`Promotion with ID ${promotionId} not found`);
		}

		const question = await this.questionRepository.findById(new QuestionId(questionId));
		if (!question) {
			throw new NotFoundError(`Question with ID ${questionId} not found`);
		}

		DomainEventPublisher.subscribe(this.scheduleSessionListener);

		try {
			const updatingExistingPlannedQuestion = !!id;
			if (updatingExistingPlannedQuestion) {
				promotion.updatePlannedQuestionSchedule(new PlannedQuestionId(id), startingOn, endingOn);
			} else {
				promotion.planQuestion(question.id, startingOn, endingOn);
			}

			await this.promotionRepository.save(promotion);

			// Manually publish events
			const events = promotion.getDomainEvents();
			await Promise.all(events.map((event) => DomainEventPublisher.publish(event)));
			promotion.clearDomainEvents();
		} finally {
			DomainEventPublisher.unsubscribe(this.scheduleSessionListener);
		}
	}
}
