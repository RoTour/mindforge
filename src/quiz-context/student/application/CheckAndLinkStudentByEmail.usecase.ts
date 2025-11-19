import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';

type CheckAndLinkOutput = 
	| { status: 'LINKED' }
	| { status: 'ALREADY_LINKED' }
	| { status: 'NOT_FOUND' };

export class CheckAndLinkStudentByEmailUsecase {
	constructor(private readonly studentRepository: IStudentRepository) {}

	async execute(email: string, authId: string): Promise<CheckAndLinkOutput> {
		const student = await this.studentRepository.findStudentByEmail(email);

		if (!student) {
			return { status: 'NOT_FOUND' };
		}

		if (student.authId) {
			return { status: 'ALREADY_LINKED' };
		}

		student.linkToUserAccount(authId);
		// Ensure email is set (though it matched, so it should be set, but good for consistency)
		student.email = email; 
		
		await this.studentRepository.save(student);

		return { status: 'LINKED' };
	}
}
