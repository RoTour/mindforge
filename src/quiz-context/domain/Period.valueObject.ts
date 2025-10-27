export class Period {
	value: `${number}/${number}`;

	constructor(baseYear: number) {
		this.value = `${baseYear}/${baseYear + 1}`;
	}
}
