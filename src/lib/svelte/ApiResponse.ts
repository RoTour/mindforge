type _ApiResponse<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };

export class ApiResponse<T> {
	constructor(private readonly response: _ApiResponse<T>) {}

	static success<T>(data: T): _ApiResponse<T> {
		return {
			success: true,
			data
		};
	}

	static failure<T>(error: string): _ApiResponse<T> {
		return {
			success: false,
			error
		};
	}

	isSuccess(): boolean {
		return this.response.success;
	}

	errorMessage(): string {
		if (this.response.success) {
			throw new Error('Cannot get error message from a successful ApiResponse');
		}
		return this.response.error;
	}

	data(): T {
		if (!this.response.success) {
			throw new Error('Cannot get data from a failed ApiResponse');
		}
		return this.response.data;
	}
}
