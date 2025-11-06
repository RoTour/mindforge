// src/quiz-context/domain/Question.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { QuestionId } from './QuestionId.valueObject';
import type { TeacherId } from './TeacherId.valueObject';
import { QuestionTextTooShortError } from './errors/Question.errors';

type QuestionProps = {
	id: QuestionId;
	text: string;
	authorId: TeacherId;
};

export class Question extends AggregateRoot<QuestionId> {
	public static MIN_TEXT_LENGTH = 5;
	public text: string;
	public authorId: TeacherId;

	private constructor(id: QuestionId, text: string, authorId: TeacherId) {
		super(id);
		this.text = text;
		this.authorId = authorId;
	}

	private static validateText(text: string): void {
		if (text.length < Question.MIN_TEXT_LENGTH) {
			throw new QuestionTextTooShortError();
		}
	}

	public static create(props: { text: string; authorId: TeacherId }): Question {
		this.validateText(props.text);

		const id = new QuestionId();
		return new Question(id, props.text, props.authorId);
	}

	/**
	 * Rehydrate does NOT validate. It trusts the data source.
	 */
	public static rehydrate(props: QuestionProps): Question {
		const question = new Question(props.id, props.text, props.authorId);
		return question;
	}

	public updateText(newText: string) {
		Question.validateText(newText);
		this.text = newText;
	}
}
