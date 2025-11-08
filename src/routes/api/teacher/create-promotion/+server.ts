import { AppError } from '$lib/error/Error';
import { ApiResponse } from '$lib/svelte/ApiResponse';
import { ParseStudentListUsecase } from '$quiz/student/application/ParseStudentList.usecase';
import { ImageStudentListParser } from '$quiz/student/infra/StudentListParser/ImageStudentListParser';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!file) {
		return json(ApiResponse.failure('File not found'));
	}

	const usecase = new ParseStudentListUsecase(new ImageStudentListParser());

	try {
		const result = await usecase.execute({ file: file as File });
		return json(
			ApiResponse.success({
				students: result
			})
		);
	} catch (error) {
		return json(
			ApiResponse.failure(`Failed to parse student list [${new AppError(error).getMessage()}]`)
		);
	}
};
