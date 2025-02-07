export type UIQuestion = {
	id: string
	content: string
	answers: string[]
}

export class QuestionVM {
	private question: UIQuestion;
	private answerSelection: Map<string, boolean> = new Map();

	constructor(question: UIQuestion) {
		this.question = question;
		question.answers.forEach(answer => this.answerSelection.set(answer, false));
	}

	get content() {
		return this.question.content;
	}

	get answers() {
		return this.question.answers;
	}

	toggleSelect(answer: string) {
		this.answerSelection.set(answer, !this.answerSelection.get(answer));
	}

	answer() {
		return Array.from(this.answerSelection.entries())
			.filter(([, isSelected]) => isSelected)
			.map(([answer, ]) => answer);
	}
}