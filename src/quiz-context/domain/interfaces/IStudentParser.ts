export interface StudentData {
	name: string; // firstname, or default name
	lastName?: string;
	email?: string;
}

export interface IStudentListParser {
	parse(input: File | string): Promise<StudentData[]>;
}
