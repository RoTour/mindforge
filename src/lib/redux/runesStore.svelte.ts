// @redux/runesStore.svelte.ts
import { onDestroy } from 'svelte';
import type { RootState, AppStore } from './store';

export class RuneStore {
	// Using Svelte’s $state rune to create a reactive proxy for the Redux state
	state: RootState = $state({} as RootState);
	// Hold onto the unsubscribe function so we can clean up
	private $unsubscribe: () => void;

	constructor(store: AppStore) {
		// Initialize the state as a reactive state using Svelte runes
		this.state = store.getState();

		// Subscribe to Redux store updates
		this.$unsubscribe = store.subscribe(() => {
			// Update the reactive state with the new store state.
			// Since Svelte’s runes use proxies, simply reassigning will trigger updates.
			this.state = store.getState();
		});

		// Clean up the subscription when the component using this class is destroyed.
		onDestroy(() => {
			this.$unsubscribe();
		});
	}
}
