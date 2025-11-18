import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { StudentId } from './StudentId.valueObject';

type StudentProps = {
	id: StudentId;
	name: string;
	lastName?: string;
	email?: string;
	authId?: string;
};

export class Student extends AggregateRoot<StudentId> {
	email: string | undefined;
	name: string;
	lastName: string | undefined;
	authId: string | undefined;

	private constructor(props: StudentProps) {
		const { id, email, name, lastName, authId } = props;
		super(id);
		this.name = name;
		this.email = email;
		this.lastName = lastName;
		this.authId = authId;
	}

	static create(props: Omit<StudentProps, 'id'> & Partial<Pick<StudentProps, 'id'>>) {
		return new Student({
			id: props.id ?? new StudentId(),
			...props
		});
	}

	static rehydrate(props: StudentProps): Student {
		return new Student(props);
	}

	linkToUserAccount(userId: string) {
		this.authId = userId;
	}
}
