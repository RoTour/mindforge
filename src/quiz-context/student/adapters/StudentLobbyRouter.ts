// src/quiz-context/student/adapters/StudentLobbyRouter.ts
import { router } from '$lib/server/trpc/init';
import { studentProcedure } from '$lib/server/trpc/procedures/studentProcedure';
import { GetActiveQuestionSessionForStudentUsecase } from '$quiz/question-session/application/GetActiveQuestionSessionForStudentUsecase';
import { serviceProvider } from '$lib/server/container';

const getActiveQuestionSession = new GetActiveQuestionSessionForStudentUsecase(
	serviceProvider.QuestionSessionRepository
);

export const StudentLobbyRouter = router({
	getActiveSession: studentProcedure.query(async ({ ctx }) => {
		const { promotionId, student } = ctx;

		const activeSession = await getActiveQuestionSession.execute({
			promotionId,
			studentId: student.id
		});

		if (!activeSession) {
			return null;
		}

		return {
			id: activeSession.id.id(),
			questionId: activeSession.questionId.id(),
			endsAt: activeSession.endsAt
		};
	})
});
