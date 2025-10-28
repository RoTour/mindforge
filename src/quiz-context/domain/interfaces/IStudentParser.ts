export interface StudentParsed {
	name: string; // firstname, or default name
	lastName?: string;
	email?: string;
}

export interface IStudentListParser {
	parse(input: File | string): Promise<StudentParsed[]>;
}
