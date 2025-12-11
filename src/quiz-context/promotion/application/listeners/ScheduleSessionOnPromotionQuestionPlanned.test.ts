// src/quiz-context/promotion/application/listeners/ScheduleSessionOnPromotionQuestionPlanned.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';
import { ScheduleSessionOnPromotionQuestionPlanned } from './ScheduleSessionOnPromotionQUestionPlanned.listener';

describe('Listener: ScheduleSessionOnPromotionQuestionPlanned', () => {
	let listener: ScheduleSessionOnPromotionQuestionPlanned;
	let mockQueue: { add: ReturnType<typeof vi.fn> };
	let mockUsecase: { execute: ReturnType<typeof vi.fn> };

	const promotionId = 'promo-123';
	const questionId = 'question-456';
	const futureStartDate = new Date(Date.now() + 86400000); // 1 day from now
	const futureEndDate = new Date(Date.now() + 86400000 + 3600000); // 1 day + 1 hour

	beforeEach(() => {
		vi.resetAllMocks();
		mockQueue = { add: vi.fn() };
		mockUsecase = { execute: vi.fn().mockResolvedValue(undefined) };
		listener = new ScheduleSessionOnPromotionQuestionPlanned(
			mockQueue as any,
			mockUsecase as any
		);
	});

	it('should create a LiveSession immediately when a question is planned with future dates', async () => {
		// GIVEN
		const event = new PromotionQuestionPlanned(
			promotionId,
			questionId,
			futureStartDate,
			futureEndDate
		);

		// WHEN
		await listener.handle(event);

		// THEN - Session is created immediately, not just scheduled
		expect(mockUsecase.execute).toHaveBeenCalledOnce();
		expect(mockUsecase.execute).toHaveBeenCalledWith({
			promotionId,
			questionIds: [questionId],
			scheduledDate: futureStartDate,
			endsAt: futureEndDate
		});
	});

	it('should create a LiveSession when a question is planned with past start but future end', async () => {
		// GIVEN
		const pastStartDate = new Date(Date.now() - 3600000); // 1 hour ago
		const futureEnd = new Date(Date.now() + 3600000); // 1 hour from now
		const event = new PromotionQuestionPlanned(
			promotionId,
			questionId,
			pastStartDate,
			futureEnd
		);

		// WHEN
		await listener.handle(event);

		// THEN
		expect(mockUsecase.execute).toHaveBeenCalledOnce();
		expect(mockUsecase.execute).toHaveBeenCalledWith({
			promotionId,
			questionIds: [questionId],
			scheduledDate: pastStartDate,
			endsAt: futureEnd
		});
	});

	it('should ignore events that are not PromotionQuestionPlanned', async () => {
		// GIVEN
		const wrongEvent = { type: 'SomeOtherEvent', payload: {} };

		// WHEN
		await listener.handle(wrongEvent as any);

		// THEN
		expect(mockUsecase.execute).not.toHaveBeenCalled();
		expect(mockQueue.add).not.toHaveBeenCalled();
	});
});
