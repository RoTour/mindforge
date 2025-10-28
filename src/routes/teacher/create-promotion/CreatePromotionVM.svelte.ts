import { ApiResponse } from '$lib/svelte/ApiResponse';
import type { StudentDTO } from '$quiz/application/dtos/StudentDTO';

export class CreatePromotionVM {
	parsedStudents: StudentDTO[] = $state([]);
	isLoading = $state(false);
	errorMessage = $state('');

	constructor() {}

	private resetState = () => {
		this.parsedStudents = [];
		this.isLoading = false;
		this.errorMessage = '';
	};

	parsePromotionFromFile = async (file: File) => {
		this.resetState();
		this.isLoading = true;
		try {
			const formData = new FormData();
			formData.append('file', file);
			const result = await fetch('/api/teacher/create-promotion', {
				method: 'POST',
				body: formData
			});
			const json = await result.json();
			const apiResponse = new ApiResponse<{ students: StudentDTO[] }>(json);
			console.debug('Api response', apiResponse, apiResponse.data(), apiResponse.data().students);
			if (apiResponse.isSuccess()) {
				this.parsedStudents = apiResponse.data().students as StudentDTO[];
			} else {
				this.errorMessage = apiResponse.errorMessage() || 'An unknown error occurred.';
			}
		} catch {
			this.errorMessage = 'Failed to parse student list. Please try again.';
		}
		this.isLoading = false;
	};
}
