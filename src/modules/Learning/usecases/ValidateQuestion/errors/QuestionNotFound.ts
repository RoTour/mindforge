export class QuestionNotFound extends Error {
	constructor(questionId: string) {
		super(`Question not found: ${questionId}`);
		this.name = 'QuestionNotFound';
	}
}