<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { clickOutside } from '$lib/svelte/directives/clickOutside';

	type Item = { value: string; label: string };
	type Props = {
		items: Item[];
		defaultItem?: Item;
		class?: string;
		label?: string;
		customStyles?: {
			label?: string;
			button?: string;
			list?: string;
			item?: string;
		};
		onItemSelected?: (value: string) => void;
	};
	let {
		items,
		defaultItem,
		class: className = '',
		customStyles,
		onItemSelected,
		label
	}: Props = $props();

	let selected: Item | undefined = $state(defaultItem ?? items[0]);
	let isOpen = $state(false);

	// Set selected if default is changed
	$effect(() => {
		selected = defaultItem ?? items[0];
	})

	const onItemSelect = (item: Item) => {
		console.debug('onItemSelect', item);
		selected = item;
		onItemSelected?.(item.value);
		toggleExpanded();
	};

	const toggleExpanded = () => {
		console.log('toggleExpanded isOpen', !isOpen);
		isOpen = !isOpen;
	};
</script>

<div class="relative w-full {className}" use:clickOutside onclickOutside={() => (isOpen = false)}>
	{#if label}
		<p
			class={customStyles?.label
				? customStyles.label
				: 'text-black text-opacity-60 dark:text-white'}
		>
			{label}
		</p>
	{/if}
	<button
		class={customStyles?.button
			? customStyles.button
			: 'flex gap-1 items-center w-full dark:bg-white text-black rounded-md h-10 px-2'}
		onclick={toggleExpanded}
	>
		<ChevronDown />
		{selected?.label}
	</button>
	{#if isOpen}
		<ul
			class="{customStyles?.list ??
				''} absolute z-10 bg-white rounded-md divide-y-[.1rem] shadow-2xl min-w-24 bg-bg-primary-accent dark:bg-bg-medium overflow-hidden"
		>
			{#each items as item}
				<li
					class={customStyles?.item
						? customStyles.item
						: 'text-black text-opacity-60 cursor-pointer dark:text-white hover:bg-bg-primary hover:text-opacity-100 dark:border-t-lightless/50 dark:hover:bg-bg-light'}
				>
					<button class="px-4 py-2 w-full text-left" onclick={() => onItemSelect(item)}>
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
