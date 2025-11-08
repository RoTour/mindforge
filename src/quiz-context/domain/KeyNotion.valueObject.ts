// src/quiz-context/domain/KeyNotion.valueObject.ts
import { KeyNotionTextEmptyError } from './errors/KeyNotion.errors';

export type KeyNotionProps = {
	text: string;
	description?: string;
	weight?: number;
	synonyms?: string[];
};

export class KeyNotion {
	public readonly text: string;
	public readonly description?: string;
	public readonly weight: number;
	public readonly synonyms: string[];

	constructor(props: KeyNotionProps) {
		if (!props.text || props.text.trim().length === 0) {
			throw new KeyNotionTextEmptyError();
		}

		this.text = props.text;
		this.description = props.description;
		this.weight = props.weight ?? 1; // Default weight to 1
		this.synonyms = props.synonyms ?? [];
	}
}
