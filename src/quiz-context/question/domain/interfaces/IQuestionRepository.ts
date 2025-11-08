// src/quiz-context/domain/interfaces/IQuestionRepository.ts
import type { Question } from '../Question.entity';
import type { QuestionId } from '../QuestionId.valueObject';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

export interface IQuestionRepository {
	save(question: Question): Promise<void>;
	findById(id: QuestionId): Promise<Question | null>;
	findByAuthorId(authorId: TeacherId): Promise<Question[]>;
}
