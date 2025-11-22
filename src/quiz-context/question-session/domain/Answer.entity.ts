import type { StudentId } from '$quiz/student/domain/StudentId.valueObject';
import { Grade, type GradeProps } from './Grade.valueObject';

export type AnswerProps = {
	studentId: StudentId;
	text: string;
	submittedAt: Date;
	autoGrade?: GradeProps;
	teacherGrade?: GradeProps;
	isPublished?: boolean;
};

export class Answer {
	public readonly studentId: StudentId;
	public text: string;
	public readonly submittedAt: Date;
	public autoGrade?: Grade;
	public teacherGrade?: Grade;
	public isPublished: boolean;

	constructor(props: AnswerProps) {
		this.studentId = props.studentId;
		this.text = props.text;
		this.submittedAt = props.submittedAt;
		this.autoGrade = props.autoGrade ? Grade.create(props.autoGrade) : undefined;
		this.teacherGrade = props.teacherGrade ? Grade.create(props.teacherGrade) : undefined;
		this.isPublished = props.isPublished ?? false;
	}

	public assignAutoGrade(grade: Grade) {
		this.autoGrade = grade;
	}

	public assignTeacherGrade(grade: Grade) {
		this.teacherGrade = grade;
	}

	public publishGrade() {
		this.isPublished = true;
	}

	public unpublishGrade() {
		this.isPublished = false;
	}
}
