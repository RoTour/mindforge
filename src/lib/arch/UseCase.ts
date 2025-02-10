// $lib/arch/UseCase.ts
export type InfoStatusCode = 100 | 101 | 102 | 103;
export type SuccessStatusCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
export type DeprecatedStatusCode = 305 | 306;
export type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | DeprecatedStatusCode | 307 | 308;
export type ClientErrorStatusCode =
	| 400
	| 401
	| 402
	| 403
	| 404
	| 405
	| 406
	| 407
	| 408
	| 409
	| 410
	| 411
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 421
	| 422
	| 423
	| 424
	| 425
	| 426
	| 428
	| 429
	| 431
	| 451;
export type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export type UnOfficalStatusCode = -1;

export type StatusCode =
	| InfoStatusCode
	| SuccessStatusCode
	| RedirectStatusCode
	| ClientErrorStatusCode
	| ServerErrorStatusCode
	| UnOfficalStatusCode
	| UnOfficalStatusCode;


export type UseCaseResponseSuccess<T> = {
	isSuccess: true;
	status: StatusCode;
	data: T;
};
export type UseCaseResponseError = {
	isSuccess: false;
	status: StatusCode;
	message: string;
};

export type UseCaseResponse<T> =
	| UseCaseResponseSuccess<T>
	| UseCaseResponseError;
	

export const UseCaseResponseBuilder = {
	success: <T>(status: StatusCode, data: T): UseCaseResponse<T> => ({
		isSuccess: true,
		status,
		data
	}),
	error: <T>(status: StatusCode, message: string): UseCaseResponse<T> => ({
		isSuccess: false,
		status,
		message
	})
};

export type InputFactory<TData, TDeps> = {
	data: TData;
	dependencies: TDeps;
};

export type OutputFactory<T> = UseCaseResponse<T>;

export type UseCase<Input extends { data: unknown; dependencies: unknown }, Output> = (
	dependencies: Input['dependencies']
) => {
	execute(data: Input['data']): Promise<Output>;
};

export type UseCaseSync<Input, Output> = (input: Input) => {
	execute(): Output;
};
