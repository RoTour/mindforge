export interface GradeProps {
	skillsMastered: string[];
	skillsToReinforce: string[];
	comment?: string;
}

export class Grade {
	public readonly skillsMastered: string[];
	public readonly skillsToReinforce: string[];
	public readonly comment?: string;

	constructor(props: GradeProps) {
		console.log('Grade constructor called');
		this.skillsMastered = props.skillsMastered;
		this.skillsToReinforce = props.skillsToReinforce;
		this.comment = props.comment;
	}

	public static create(props: GradeProps): Grade {
		return new Grade(props);
	}
}
