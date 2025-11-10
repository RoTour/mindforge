import { createTRPC } from '$lib/trpc';
import type {
	PlannedQuestionDTO,
	TeacherQuestionDTO
} from '$quiz/question/application/interfaces/ITeacherQuestionsQueries';

type QuestionsPageVMProps = {
	allQuestions: TeacherQuestionDTO[];
	plannedQuestions: PlannedQuestionDTO[];
	promotionId: string | null;
};

export class QuestionsPageVM {
	public readonly allQuestions: TeacherQuestionDTO[] = $state([]);
	public plannedQuestions: PlannedQuestionDTO[] = $state([]);
	promotionId: string | null = $state(null);

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
	}
}
