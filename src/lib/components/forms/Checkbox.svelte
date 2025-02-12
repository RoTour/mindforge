<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import IconWrapper from '$lib/components/IconWrapper.svelte';
	import { Check } from 'lucide-svelte';

	type Props = {
		checked: boolean;
		label: string;
		name: string;
		required?: boolean;
		onclick?: (newState: boolean) => void;
		options?: HTMLInputAttributes;
		class?: string;
	};
	let {
		checked = false,
		label = '',
		name = '',
		required = false,
		options,
		onclick,
		class: className = ''
	}: Props = $props();

	let id = $state(name);

	const onClick = () => {
		checked = !checked;
		onclick?.(checked);
	};
</script>

<div class="flex cursor-pointer items-center {className}">
	<label for={id}>{label}</label>
	<input type="checkbox" {name} {id} bind:checked class="hidden" {required} {...options} />
	<button
		class="checkbox relative"
		type="button"
		aria-labelledby={id}
		class:checked
		onclick={onClick}
	>
		{#if checked}
			<IconWrapper
				size="6"
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&_svg]:stroke-primary-dark"
			>
				<Check />
			</IconWrapper>
		{/if}
	</button>
</div>

<style lang="postcss">
	.checkbox {
		@apply h-6 w-6 min-h-6 min-w-6 rounded-md border-2 border-background dark:border-white border-opacity-50 bg-transparent p-0 shadow-sm outline-2 outline-accent;
	}
	.checkbox:hover {
		@apply dark:bg-background/50;
	}
	/* .checkbox.checked::before {
		@apply bg-primary-dark p-0;
		content: '';
		width: 80%;
		height: 80%;
		margin: auto;
		display: block;

		transition: 120ms transform ease-in-out;
		transform-origin: bottom left;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	} 
  */
</style>
