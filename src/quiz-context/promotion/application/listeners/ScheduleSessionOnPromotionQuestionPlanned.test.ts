import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';
import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';
import { ScheduleSessionOnPromotionQuestionPlanned } from './ScheduleSessionOnPromotionQUestionPlanned.listener';
import type { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import type { IMessageQueue } from '$lib/ddd/interfaces/IMessageQueue';

describe('Listener: ScheduleSessionOnPromotionQuestionPlanned', () => {
	let listener: ScheduleSessionOnPromotionQuestionPlanned;
	let mockQueue: IMessageQueue;
	let addJobSpy: Mock;
	let mockQuestionSessionCreator: CreateQuestionSessionUsecase;

	beforeEach(() => {
		// Create a mock instance of the creator service
		mockQuestionSessionCreator = {
			execute: vi.fn()
		} as unknown as CreateQuestionSessionUsecase;

		addJobSpy = vi.fn();
		mockQueue = {
			add: addJobSpy,
			process: vi.fn() // Not used in this test
		} as unknown as IMessageQueue;

		listener = new ScheduleSessionOnPromotionQuestionPlanned(mockQueue, mockQuestionSessionCreator);

		// Use fake timers to control time-based logic like calculating the delay.
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	test('Given a future-dated event, When handled, Then a delayed job should be scheduled', async () => {
		// --- GIVEN (Arrange) ---
		const now = new Date('2025-10-01T10:00:00.000Z');
		const startingOn = new Date('2025-10-01T11:00:00.000Z'); // 1 hour from now
		const endingOn = new Date('2025-10-01T12:00:00.000Z'); // 2 hours from now
		vi.setSystemTime(now);

		const promotionId = 'promo-123';
		const questionId = 'question-456';
		const event = new PromotionQuestionPlanned(promotionId, questionId, startingOn, endingOn);

		// --- WHEN (Act) ---
		await listener.handle(event);

		// --- THEN (Assert) ---
		expect(addJobSpy).toHaveBeenCalledOnce();
		expect(mockQuestionSessionCreator.execute).not.toHaveBeenCalled();
	});

	test('Given a past-dated event, When handled, Then no job should be scheduled and no session created', async () => {
		// --- GIVEN (Arrange) ---
		const now = new Date('2025-10-01T10:00:00.000Z');
		const pastStartingOn = new Date('2025-10-01T09:00:00.000Z'); // 1 hour in the past
		const pastEndingOn = new Date('2025-10-01T09:30:00.000Z'); // also in the past
		vi.setSystemTime(now);

		const event = new PromotionQuestionPlanned(
			'promo-123',
			'question-456',
			pastStartingOn,
			pastEndingOn
		);

		// --- WHEN (Act) ---
		await listener.handle(event);

		// --- THEN (Assert) ---
		expect(addJobSpy).not.toHaveBeenCalled();
		expect(mockQuestionSessionCreator.execute).not.toHaveBeenCalled();
	});

	test('Given a currently active event, When handled, Then a session should be created immediately', async () => {
		// --- GIVEN (Arrange) ---
		const now = new Date('2025-10-01T10:00:00.000Z');
		const pastStartingOn = new Date('2025-10-01T09:00:00.000Z'); // 1 hour in the past
		const futureEndingOn = new Date('2025-10-01T11:00:00.000Z'); // 1 hour in the future
		vi.setSystemTime(now);

		const promotionId = 'promo-123';
		const questionId = 'question-456';
		const event = new PromotionQuestionPlanned(
			promotionId,
			questionId,
			pastStartingOn,
			futureEndingOn
		);

		// --- WHEN (Act) ---
		await listener.handle(event);

		// --- THEN (Assert) ---
		expect(addJobSpy).not.toHaveBeenCalled();
		expect(mockQuestionSessionCreator.execute).toHaveBeenCalledOnce();
		expect(mockQuestionSessionCreator.execute).toHaveBeenCalledWith({
			promotionId,
			questionId,
			startedAt: pastStartingOn,
			endsAt: futureEndingOn
		});
	});
});
