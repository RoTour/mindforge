import type { IStudentListParser } from '../domain/interfaces/IStudentParser';
import z from 'zod';
import { BadRequestError } from '$quiz/application/errors/BadRequestError';
import { StudentId } from '../domain/StudentId.valueObject';
import type { CreateStudentDTO } from './dtos/StudentDTO';

const ParseStudentListCommandSchema = z
	.object({
		file: z.file()
	})
	.or(
		z.object({
			stringContent: z.string()
		})
	);

export class ParseStudentListUsecase {
	constructor(private readonly studentListParser: IStudentListParser) {}

	async execute(payload: unknown): Promise<CreateStudentDTO[]> {
		const parsedCommand = ParseStudentListCommandSchema.safeParse(payload);
		if (!parsedCommand.success) {
			console.debug(parsedCommand.error);
			throw new BadRequestError(z.treeifyError(parsedCommand.error).errors.join(', '));
		}

		const result = await this.studentListParser.parse(
			'file' in parsedCommand.data ? parsedCommand.data.file : parsedCommand.data.stringContent
		);
		return result.map((student) => ({
			...student,
			id: new StudentId().id()
		}));
	}
}
