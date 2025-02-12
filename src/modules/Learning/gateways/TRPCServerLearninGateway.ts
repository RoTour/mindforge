import { createContext } from '$lib/trpc/context'
import { createCaller } from '$lib/trpc/router'
import type { RequestEvent } from '@sveltejs/kit';
import type { ILearningGateway } from './ILearningGateways';

export const TRPCServerLearningGateway = (event: RequestEvent): ILearningGateway => {
	const buildCaller = async () => {
		return (createCaller(await createContext(event)));
	}

	return {
		createQuestion: async (dto) => {
			const caller = await buildCaller();
			return caller.learning.createQuestion({ ...dto });
		},
		getUserQuestions: async (userId) => {
			const caller = await buildCaller();
			return caller.learning.getUserQuestions(userId);
		},
		saveQuestion: async (question) => {
			const caller = await buildCaller();
			return caller.learning.saveQuestion(question);
		},
		getQuestion: async (id) => {
			const caller = await buildCaller();
			return caller.learning.getQuestion(id);
		},
		getQuestionToValidate: async (questionId) => {
			const caller = await buildCaller();
			return caller.learning.getQuestionToValidate(questionId);
		},
		storeQuestion: async (question) => {
			const caller = await buildCaller();
			return caller.learning.storeQuestion(question);
		}
	}
}