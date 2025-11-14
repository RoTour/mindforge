import type { AppRouter } from '$lib/server/trpc/router';
import { createTRPC } from '$lib/trpc';
import type {
	PlannedQuestionDTO,
	TeacherQuestionDTO
} from '$quiz/question/application/interfaces/ITeacherQuestionsQueries';
import type { TRPCClient } from '@trpc/client';
import { SvelteDate } from 'svelte/reactivity';

type QuestionsPageVMProps = {
	allQuestions: TeacherQuestionDTO[];
	plannedQuestions: PlannedQuestionDTO[];
	promotionId: string | null;
};

export class QuestionsPageVM {
	public readonly allQuestions: TeacherQuestionDTO[] = $state([]);
	public plannedQuestions: PlannedQuestionDTO[] = $state([]);
	promotionId: string | null = $state(null);

	trpc: TRPCClient<AppRouter> | null = null;

	constructor({ allQuestions, promotionId, plannedQuestions }: QuestionsPageVMProps) {
		this.allQuestions = allQuestions;
		this.promotionId = promotionId;
		this.plannedQuestions = plannedQuestions;
	}

	async planQuestionOnPromotion(questionId: string, startingOn: Date, endingOn: Date) {
		console.debug('Planning question', {
			questionId,
			startingOn,
			endingOn
		});
		await createTRPC().promotion.planQuestion.mutate({
			promotionId: this.promotionId!,
			questionId,
			startingOn,
			endingOn
		});
		await this.refreshPlannedQuestions();
	}

	async updatePlannedQuestions(
		plannedQuestionId: string,
		questionId: string,
		startingOn: Date,
		endingOn: Date
	) {
		await createTRPC().promotion.planQuestion.mutate({
			id: plannedQuestionId,
			promotionId: this.promotionId!,
			questionId,
			startingOn,
			endingOn
		});
		await this.refreshPlannedQuestions();
	}

	async refreshPlannedQuestions() {
		this.trpc ??= createTRPC();
		if (!this.promotionId) return;
		this.plannedQuestions = await this.trpc.teacher.getPlannedQuestionsForPromotion
			.query({
				promotionId: this.promotionId!
			})
			.then((plannedQuestions) => {
				return plannedQuestions.map((res) => ({
					...res,
					startingOn: res.startingOn ? new SvelteDate(res.startingOn) : null,
					endingOn: res.endingOn ? new SvelteDate(res.endingOn) : null
				}));
			});
	}
}
