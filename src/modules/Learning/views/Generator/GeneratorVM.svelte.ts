import type { UseCaseResponseSuccess } from '$lib/arch/UseCase';
import { QuestionBuilder } from '@modules/Learning/constructors/QuestionBuilder';
import type { CreateQuestionDto } from '@modules/Learning/entities/Question';
import type { ILearningGateway } from '@modules/Learning/gateways/ILearningGateways';
import { TRPCLearningGateways } from '@modules/Learning/gateways/TRPCLearningGateways';
import { CreateQuestion } from '@modules/Learning/usecases/CreateQuestion/CreateQuestion';
import type { TRPCClientInit } from 'trpc-sveltekit';

export class GeneratorVM {
	generating: boolean = $state(false);
	saving: boolean = $state(false);
	savingStatus: 'success' | 'partial' | 'failed' | 'none' = $state('none');

	prompt: string = $state('');
	propositions: CreateQuestionDto[] = $state([]);
	error: string = $state('');
	private gateway: ILearningGateway;

	constructor(init?: TRPCClientInit) {
		this.gateway = TRPCLearningGateways(init);
	}

	startGeneration = async () => {
		this.generating = true;
		const ucResult = await this.gateway.generateQuestions(this.prompt);
		if (!ucResult.isSuccess) {
			this.error = ucResult.message;
		} else {
			this.propositions = ucResult.data.questionDtos;
		}
		this.generating = false;
	};

	removeProposition = (prompt: string) => {
		this.propositions = this.propositions.filter((p) => p.prompt !== prompt);
	};

	async saveAll() {
		this.saving = true;
		const MAX_RETRIES = 3;

		const createQuestionUseCase = CreateQuestion({
			questionBuilder: (question) => QuestionBuilder(question).build(),
			callbacks: [],
			storeQuestion: this.gateway.storeQuestion
		});

		const executeWithRetry = async (proposition: CreateQuestionDto) => {
			for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
				try {
					return await createQuestionUseCase.execute({ dto: proposition });
				} catch (error) {
					if (attempt === MAX_RETRIES) throw error;
					await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
				}
			}
		};

		const creationQueries = this.propositions.map((it) => executeWithRetry(it));

		const results = await Promise.allSettled(creationQueries);

		// Process results
		const succeeded = results
			.filter((r) => r.status === 'fulfilled')
			.filter((r) => r.value?.isSuccess)
			.map((r) => (r.value as UseCaseResponseSuccess<CreateQuestionDto>).data);
		const failed = results
			.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.isSuccess))
			.map((r) => (r as PromiseRejectedResult).reason);

		this.savingStatus =
			failed.length === 0 ? 'success' : succeeded.length === 0 ? 'failed' : 'partial';

		this.propositions = this.propositions.filter(
			(proposition) => !succeeded.some((s) => s.prompt === proposition.prompt)
		);
		this.saving = false;
	}
}
