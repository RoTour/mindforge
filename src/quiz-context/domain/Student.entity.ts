import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { StudentId } from './StudentId.valueObject';

type StudentProps = {
	id: StudentId;
	name: string;
	lastName?: string;
	email?: string;
};

export class Student extends AggregateRoot<StudentId> {
	email: string | undefined;
	name: string;
	lastName: string | undefined;

	private constructor(props: StudentProps) {
		const { id, email, name, lastName } = props;
		super(id);
		this.name = name;
		this.email = email;
		this.lastName = lastName;
	}

	static create(props: Omit<StudentProps, 'id'> & Partial<Pick<StudentProps, 'id'>>) {
		return new Student({
			id: props.id ?? new StudentId(),
			...props
		});
	}
}
