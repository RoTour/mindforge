// src/quiz-context/student/adapters/StudentLobbyRouter.ts
import { router } from '$lib/server/trpc/init';
import { studentProcedure } from '$lib/server/trpc/procedures/studentProcedure';
import { GetActiveQuestionSessionForStudentUsecase } from '$quiz/question-session/application/GetActiveQuestionSessionForStudentUsecase';
import { serviceProvider } from '$lib/server/container';

const getActiveQuestionSession = new GetActiveQuestionSessionForStudentUsecase(serviceProvider.StudentLobbyQueries);

export const StudentLobbyRouter = router({
    getActiveSession: studentProcedure
        .query(async ({ ctx }) => {
            const { promotionId } = ctx;

            const activeSession = await getActiveQuestionSession.execute({ promotionId });

            return activeSession;
        })
});
