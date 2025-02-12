import { QuestionBuilder } from '@modules/Learning/constructors/QuestionBuilder';
import {
	CreateQuestionDtoSchema,
	type CreateQuestionDto
} from '@modules/Learning/entities/Question';
import { TRPCServerLearningGateway } from '@modules/Learning/gateways/TRPCServerLearninGateway';
import { CreateQuestion } from '@modules/Learning/usecases/CreateQuestion/CreateQuestion';
import type { Actions } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const initialData: CreateQuestionDto = {
		answer: '',
		prompt: '',
		type: 'SIMPLE',
		options: ['']
	};
	const form = await superValidate(initialData, zod(CreateQuestionDtoSchema));
	return {
		form
	};
};

export const actions: Actions = {
	createQuestion: async (event) => {
		const form = await superValidate(event.request, zod(CreateQuestionDtoSchema));
		if (!form.valid) return message(form, 'Form is invalid', { status: 400 });

		const { data } = form;
		const gateway = TRPCServerLearningGateway(event);
		try {
			const createQuestionUseCase = await CreateQuestion({
				questionBuilder: () => QuestionBuilder(data).build(),
				callbacks: [],
				storeQuestion: gateway.storeQuestion
			}).execute({ dto: data });
			if (createQuestionUseCase.isSuccess) {
				return message(form, {
					message: 'Question created',
					question: createQuestionUseCase.data
				});
			}
			throw new Error('Error creating question');
		} catch (error) {
			console.error(error);
			return message(form, 'Error creating question', { status: 500 });
		}
	}
};
