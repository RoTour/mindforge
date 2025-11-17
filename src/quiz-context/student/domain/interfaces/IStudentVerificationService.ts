// @path: src/quiz-context/student/domain/interfaces/IStudentVerificationService.ts
import type { StudentId } from '../StudentId.valueObject';

export interface IStudentVerificationService {
	requestVerification(studentId: StudentId, email: string): Promise<void>;
}
