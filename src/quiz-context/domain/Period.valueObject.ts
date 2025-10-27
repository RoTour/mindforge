export class Period {
	baseYear: number;
	value: `${number}/${number}`;

	constructor(baseYear: number) {
		this.baseYear = baseYear;
		this.value = `${baseYear}/${baseYear + 1}`;
	}
}
