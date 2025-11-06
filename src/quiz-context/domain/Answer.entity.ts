// src/quiz-context/domain/Answer.entity.ts
import type { StudentId } from './StudentId.valueObject';

export type AnswerProps = {
	studentId: StudentId;
	text: string;
	submittedAt: Date;
	grade?: number;
	assessment?: string;
};

export class Answer {
	public readonly studentId: StudentId;
	public text: string;
	public readonly submittedAt: Date;
	public grade?: number;
	public assessment?: string;

	constructor(props: AnswerProps) {
		this.studentId = props.studentId;
		this.text = props.text;
		this.submittedAt = props.submittedAt;
		this.grade = props.grade;
		this.assessment = props.assessment;
	}

	public assignGrade(grade: number, assessment: string) {
		this.grade = grade;
		this.assessment = assessment;
	}
}
