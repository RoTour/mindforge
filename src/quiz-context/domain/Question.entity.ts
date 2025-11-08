// src/quiz-context/domain/Question.entity.ts
import { AggregateRoot } from '$lib/ddd/interfaces/AggregateRoot';
import { QuestionId } from './QuestionId.valueObject';
import type { TeacherId } from './TeacherId.valueObject';
import { QuestionTextTooShortError } from './errors/Question.errors';
import { KeyNotion, type KeyNotionProps } from './KeyNotion.valueObject';

type QuestionProps = {
	id: QuestionId;
	text: string;
	authorId: TeacherId;
	keyNotions?: KeyNotionProps[];
};

export class Question extends AggregateRoot<QuestionId> {
	public static MIN_TEXT_LENGTH = 5;
	public text: string;
	public authorId: TeacherId;
	public keyNotions: KeyNotion[];

	private constructor(id: QuestionId, text: string, authorId: TeacherId, keyNotions: KeyNotion[]) {
		super(id);
		this.text = text;
		this.authorId = authorId;
		this.keyNotions = keyNotions;
	}

	private static validateText(text: string): void {
		if (text.length < Question.MIN_TEXT_LENGTH) {
			throw new QuestionTextTooShortError();
		}
	}

	public static create(props: {
		text: string;
		authorId: TeacherId;
		keyNotions?: KeyNotion[];
	}): Question {
		this.validateText(props.text);

		const id = new QuestionId();
		return new Question(id, props.text, props.authorId, props.keyNotions ?? []);
	}

	/**
	 * Rehydrate does NOT validate. It trusts the data source.
	 */
	public static rehydrate(props: QuestionProps): Question {
		const notions = (props.keyNotions ?? []).map((p) => new KeyNotion(p));
		const question = new Question(props.id, props.text, props.authorId, notions);
		return question;
	}

	public updateText(newText: string) {
		Question.validateText(newText);
		this.text = newText;
	}

	public setKeyNotions(newNotions: KeyNotion[]) {
		this.keyNotions = newNotions;
	}
}
