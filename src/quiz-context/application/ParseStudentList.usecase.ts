import type { IStudentListParser } from '$quiz/domain/interfaces/IStudentParser';
import z from 'zod';
import { BadRequestError } from './errors/BadRequestError';
import { StudentId } from '$quiz/domain/StudentId.valueObject';
import type { StudentDTO } from './dtos/StudentDTO';

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

	async execute(payload: unknown): Promise<StudentDTO[]> {
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
