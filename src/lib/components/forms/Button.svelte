<script lang="ts">
	import type { CustomCssProps } from '$lib/svelte/CustomCssProps';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		primary?: boolean;
		accent?: boolean;
		onclick?: () => void;
		type?: 'submit' | 'button';
		href?: string;
	} & CustomCssProps;

	let {
		children,
		type,
		onclick,
		href,
		class: className,
		primary = false,
		accent = false
	}: Props = $props();

	let styling = accent
		? `bg-accent text-contrast-accent`
		: primary
			? `bg-primary text-contrast-primary`
			: `bg-surface text-contrast-surface`;
</script>

{#if href}
	<a
		{href}
		class="flex w-full items-center justify-center rounded-md border-2 border-primary px-4 py-2
	{styling} {className}"
	>
		{@render children()}
	</a>
{:else}
	<button
		{onclick}
		type={type ?? 'submit'}
		class="flex w-full items-center justify-center rounded-md border-2 border-primary px-4 py-2
  {styling} {className}"
	>
		{@render children()}
	</button>
{/if}
