<script lang="ts">
	import type { CustomCssProps } from '$lib/svelte/CustomCssProps';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		onclick?: () => void;
		primary?: boolean;
		accent?: boolean;
	} & CustomCssProps;

  
	let { children, onclick, class: className, primary = false, accent = false }: Props = $props();

  let styling = accent ? `bg-accent text-contrast-accent` : primary ? `bg-primary text-contrast-primary` : `bg-surface text-contrast-surface`;
</script>

<button
	{onclick}
	class="border-primary flex w-full items-center justify-center rounded-md border-2 px-4 py-2
  {styling} {className}"
>
	{@render children()}
</button>
