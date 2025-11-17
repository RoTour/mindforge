import { beforeAll, vi } from 'vitest';
import { createMockServiceProvider } from '../src/lib/tests/mocks/serviceProvider.mock';

export const mockedServiceProvider = createMockServiceProvider();

beforeAll(() => {
	vi.mock('$lib/server/container', () => ({
		serviceProvider: mockedServiceProvider
	}));
});
