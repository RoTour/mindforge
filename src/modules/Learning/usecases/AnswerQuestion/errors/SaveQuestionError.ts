export class SaveQuestionError extends Error {
	constructor(questionId: string) {
		super(`Error saving question: ${questionId}`);
		this.name = 'SaveQuestionError';
	}
}