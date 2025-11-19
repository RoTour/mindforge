import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import { StudentAlreadyLinkedError, StudentNotFoundError } from './errors';

export class LinkStudentToUserUsecase {
	constructor(private studentRepository: IStudentRepository) {}

	async execute(studentId: string, authId: string, email: string): Promise<void> {
		const student = await this.studentRepository.findById(studentId);

		if (!student) {
			throw new StudentNotFoundError(studentId);
		}

		if (student.authId && student.authId !== authId) {
			throw new StudentAlreadyLinkedError(studentId);
		}

		student.linkToUserAccount(authId);
		student.email = email;
		await this.studentRepository.save(student);
	}
}
