// src/quiz-context/question-session/application/SubmitAnswerUsecase.ts
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Answer } from '../domain/Answer.entity';
import { TRPCError } from '@trpc/server';

export type SubmitAnswerCommand = {
    questionSessionId: string;
    studentId: string;
    answerText: string;
};

export class SubmitAnswerUsecase {
    constructor(private readonly questionSessionRepository: IQuestionSessionRepository) {}

    async execute(command: SubmitAnswerCommand): Promise<void> {
        const session = await this.questionSessionRepository.findById(new QuestionSessionId(command.questionSessionId));
        if (!session) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Question session not found' });
        }

        const answer = new Answer({
            studentId: new StudentId(command.studentId),
            text: command.answerText,
            submittedAt: new Date()
        });

        session.submitAnswer(answer);

        await this.questionSessionRepository.save(session);
    }
}
