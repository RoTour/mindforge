const fibSuite = [1, 2, 3, 5, 8, 13, 21]

export const FibService = () => ({
	getNext: (previous: number) => {
		const index = fibSuite.indexOf(previous);
		if (index === -1) {
			throw new Error("Previous value not found in Fibonacci sequence");
		}
		return fibSuite[index + 1] ?? -1;
	},
	getFromIndex: (index: number) => {
		return fibSuite[index] ?? -1;
	}
})