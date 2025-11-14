import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { AppError } from '$lib/error/Error';
import { ApiResponse } from '$lib/svelte/ApiResponse';
import { createTRPC } from '$lib/trpc';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { CreateStudentDTO } from '$quiz/student/application/dtos/StudentDTO';
import { SvelteDate } from 'svelte/reactivity';

export class CreatePromotionVM {
	students: CreateStudentDTO[] = $state([]);
	isLoading = $state(false);
	errorMessage = $state('');
	promotionName = $state('');
	baseYear = $state(new SvelteDate().getFullYear());
	skippingUpload = $state(false);
	private trpc = createTRPC();

	constructor(private readonly mockParsing = false) {}

	private resetState = () => {
		this.students = [];
		this.isLoading = false;
		this.errorMessage = '';
	};

	parsePromotionFromFile = async (file: File) => {
		if (this.mockParsing) {
			this.students = mockStudents;
			return;
		}
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
			const apiResponse = new ApiResponse<{ students: CreateStudentDTO[] }>(json);
			console.debug('Api response', apiResponse, apiResponse.data(), apiResponse.data().students);
			if (apiResponse.isSuccess()) {
				this.students = apiResponse.data().students as CreateStudentDTO[];
			} else {
				this.errorMessage = apiResponse.errorMessage() || 'An unknown error occurred.';
			}
		} catch {
			this.errorMessage = 'Failed to parse student list. Please try again.';
		}
		this.isLoading = false;
	};

	createPromotion = async () => {
		try {
			const newPromotionId = new PromotionId();
			await this.trpc.promotion.createPromotion.mutate({
				promotionId: newPromotionId.id(),
				name: this.promotionName,
				baseYear: this.baseYear,
				students: this.students
			});
			console.debug('Promotion created');
			goto(resolve(`/teacher/promotions/${newPromotionId.id()}/students`));
		} catch (error) {
			console.error(new AppError(error).getMessage());
		}
	};

	skipUpload = () => {
		this.skippingUpload = true;
	};
}

const mockStudents: CreateStudentDTO[] = [
	{
		name: 'Thomas',
		lastName: 'ABADIE',
		id: 'Student-93861132-b0d9-41bb-9ea1-954564fda894'
	},
	{
		name: 'Florian',
		lastName: 'ALBORA',
		id: 'Student-a02810fd-2544-4cd6-99e9-044e0c8220b1'
	},
	{
		name: 'Pauline',
		lastName: 'BENGHOUZI',
		id: 'Student-b1c7ecd1-1170-479d-9ce7-5943721f5500'
	},
	{
		name: 'Mateo',
		lastName: 'BENTOGLIO',
		id: 'Student-a2542341-ea7b-4222-9ab7-49f962bbb497'
	},
	{
		name: 'Julien',
		lastName: 'BERNARD',
		id: 'Student-4946086e-c35b-45d6-9f98-b1def915ec58'
	},
	{
		name: 'Nathan',
		lastName: 'BERTAUD',
		id: 'Student-bcd36659-c96e-4ab7-835a-a3c4b6cbb88a'
	},
	{
		name: 'Gaëtan',
		lastName: 'BOUGOULA',
		id: 'Student-7231240d-760b-47a7-be65-5a025de3b3a2'
	},
	{
		name: 'Swan',
		lastName: 'BRETON',
		id: 'Student-7a879cee-7df5-4c70-9abc-93708d037a5f'
	},
	{
		name: 'Théo',
		lastName: 'DECOMBES-THEFFO',
		id: 'Student-5b78ad61-8038-4b46-9fed-45e15609cd12'
	},
	{
		name: 'Florent',
		lastName: 'DETRES',
		id: 'Student-c72cdaa9-d4a0-4444-8172-ed8cb0fafae7'
	},
	{
		name: 'Mariama Dalanda',
		lastName: 'DIALLO',
		id: 'Student-34e86891-f39b-4d36-a682-358904718c1c'
	},
	{
		name: 'Léo',
		lastName: 'FAURE',
		id: 'Student-d82c1917-4fc9-42ad-8253-52cae2fd4bd4'
	},
	{
		name: 'Killian',
		lastName: 'FRAVALO',
		id: 'Student-384f9331-bd48-4ef3-b41f-c67a1d8659cc'
	},
	{
		name: 'François',
		lastName: 'GOURBAL',
		id: 'Student-52655cf8-772d-4d2d-8e2d-bfafa1d85961'
	},
	{
		name: 'Josue',
		lastName: 'KISA',
		id: 'Student-d7e37473-951a-472f-8a27-edfb2aa90215'
	},
	{
		name: 'Gaëlle',
		lastName: 'LANIC',
		id: 'Student-fd6674e4-ea44-4808-a690-01bb6fd0c78f'
	},
	{
		name: 'Vincent',
		lastName: 'LE MEUR',
		id: 'Student-55b288c4-d53a-42ca-b79c-a6c2e16cd008'
	},
	{
		name: 'Nayan',
		lastName: 'MALLET',
		id: 'Student-2fafed26-39e4-4ab1-beea-dca38a9f68ff'
	},
	{
		name: 'Mélissa',
		lastName: 'MAMIE',
		id: 'Student-3e16dfc3-3a62-48f2-9592-adc014b83573'
	},
	{
		name: 'Dalyll',
		lastName: 'REGUIA',
		id: 'Student-efc51b65-125d-4c38-bf3f-c2ae3c021ea1'
	},
	{
		name: 'Lucas',
		lastName: 'REMERY',
		id: 'Student-fc7c7731-89f1-4534-abef-4691e9e4d7dd'
	},
	{
		name: 'Nathan',
		lastName: 'REUNGOAT',
		id: 'Student-88ff6022-62ad-4d37-94cc-ad9b9e8c0e89'
	},
	{
		name: 'Théo',
		lastName: 'STOFFELBACH',
		id: 'Student-564bdd0f-3516-421d-a3db-430b8f476f9e'
	}
];
