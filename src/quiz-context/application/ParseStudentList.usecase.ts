import type { IStudentListParser } from '$quiz/domain/interfaces/IStudentParser';
import z from 'zod';
import { BadRequestError } from './errors/BadRequestError';

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

	async execute(payload: unknown) {
		const parsedCommand = ParseStudentListCommandSchema.safeParse(payload);
		if (!parsedCommand.success) {
			throw new BadRequestError(z.treeifyError(parsedCommand.error).errors.join(', '));
		}

		const result = await this.studentListParser.parse(
			'file' in parsedCommand.data ? parsedCommand.data.file : parsedCommand.data.stringContent
		);
		return result;
	}
}
