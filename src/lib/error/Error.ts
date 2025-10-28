export class AppError {
	constructor(private readonly error: unknown) {}

	public getMessage(defaultMessage = 'Unknown error occured. Try again later'): string {
		if (this.error instanceof Error) {
			return this.error.message;
		}
		return defaultMessage;
	}
}
