// src/quiz-context/student/adapters/StudentLobbyRouter.ts
import { serviceProvider } from '$lib/server/container';
import { router } from '$lib/server/trpc/init';
import { studentIsPartOfPromotionProcedure } from '$lib/server/trpc/procedures/studentIsPartOfPromotionProcedure';
import { GetActiveLiveSessionForStudentUsecase } from '$quiz/question-session/application/GetActiveLiveSessionForStudentUsecase';

const getActiveLiveSession = new GetActiveLiveSessionForStudentUsecase(
	serviceProvider.LiveSessionRepository
);

export const StudentLobbyRouter = router({
	getActiveSession: studentIsPartOfPromotionProcedure.query(async ({ ctx }) => {
		const { promotionId, student } = ctx;

		const lobbyView = await getActiveLiveSession.execute({
			promotionId,
			studentId: student.id
		});

		if (!lobbyView) {
			return null;
		}

		return {
			sessionId: lobbyView.session.id.id(),
			endsAt: lobbyView.session.endsAt,
			previousSlots: lobbyView.previousSlots,
			currentSlot: lobbyView.currentSlot,
			hasNextQuestion: lobbyView.hasNextQuestion
		};
	})
});

