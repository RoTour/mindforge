export class EnrollToPromotionVM {
	step: 'enter name' | 'validate name' | 'not found' | 'enrolled' = $state('enter name');
	studentFirstName: string = $state('');
	studentLastName: string = $state('');

	constructor() {}

	formatFullName(providedFirstName: string, providedLastName: string) {
		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
		const firstName = capitalize(providedFirstName.trim());
		const lastName = capitalize(providedLastName.trim());
		return `${firstName} ${lastName}`.trim();
	}

	async handleNameSubmitted(e: Event) {
		e.preventDefault();
	}
}
