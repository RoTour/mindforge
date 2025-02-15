// $modules/Learning/gateways/TRPCLearningGateways.ts
import { trpc } from '$lib/trpc/client';
import type { TRPCClientInit } from 'trpc-sveltekit';
import type { ILearningGateway } from './ILearningGateways';

export const TRPCLearningGateways = (init?: TRPCClientInit): ILearningGateway => {
	const client = trpc(init);
	return {
		createQuestion: async (dto) => {
			return client.learning.createQuestion.mutate({ ...dto });
		},
		getUserQuestions: async (userId) => {
			return client.learning.getUserQuestions.query(userId);
		},
		saveQuestion: async (question) => {
			return client.learning.saveQuestion.mutate(question);
		},
		getQuestion: async (id) => {
			return client.learning.getQuestion.query(id);
		},
		getQuestionToValidate: async (questionId) => {
			return client.learning.getQuestionToValidate.query(questionId);
		},
		storeQuestion: async (question) => {
			return client.learning.storeQuestion.mutate(question);
		},
		generateQuestions: async (topic) => {
			return client.learning.generateQuestions.mutate(topic);
		}
	};
};
