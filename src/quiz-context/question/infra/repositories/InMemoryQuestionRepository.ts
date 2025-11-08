// src/quiz-context/infra/QuestionRepository/InMemoryQuestionRepository.ts
import type { Question } from '$quiz/question/domain/Question.entity';
import type { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';

export class InMemoryQuestionRepository implements IQuestionRepository {
	private readonly questions = new Map<string, Question>();

	async save(question: Question): Promise<void> {
		this.questions.set(question.id.id(), question);
	}

	async findById(id: QuestionId): Promise<Question | null> {
		return this.questions.get(id.id()) ?? null;
	}

	async findByAuthorId(authorId: TeacherId): Promise<Question[]> {
		return Array.from(this.questions.values()).filter((q) => q.authorId.equals(authorId));
	}
}
