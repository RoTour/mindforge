import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import type { StudentId } from './StudentId.valueObject';

export class Student extends AggregateRoot<StudentId> {
	email: string;
	firstName: string;
	lastName: string;

	private constructor(id: StudentId, email: string, firstName: string, lastName: string) {
		super(id);
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
	}

	static create(id: StudentId, email: string, firstName: string, lastName: string) {
		return new Student(id, email, firstName, lastName);
	}
}
