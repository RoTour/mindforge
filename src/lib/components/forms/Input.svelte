<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';

	type Props = {
		type?: HTMLInputTypeAttribute;
		placeholder?: string;
		name?: string;
		label?: string;
		maxlength?: number;
		required?: boolean;
		theme?: 'dark' | 'light';
		options?: HTMLInputAttributes;
		class?: string;
		oninput?: (value: string) => void;
		value?: string;
		invalid?: boolean;
	};

	let {
		type = 'text',
		placeholder = '',
		name = '',
		label = '',
		maxlength = 100,
		required = false,
		theme = 'dark',
		options = {},
		class: className = '',
		oninput,
		value = $bindable(''),
		invalid = false
	}: Props = $props();

	const id = $state(name);
	const lightThemeClasses = 'border-2 border-black';

	function handleInput(event: Event) {
		oninput?.((event.target as HTMLInputElement).value);
	}
</script>

<div class="flex flex-1 flex-col {className}">
	<label for={id} class="block font-bold dark:text-contrast-background">
		{label}
	</label>
	<input
		bind:value
		{type}
		{name}
		{id}
		{placeholder}
		{maxlength}
		{required}
		{...options}
		oninput={handleInput}
		class="w-full rounded-md px-4 py-2 text-black focus-visible:outline-accent border-2 {theme === 'light'
			? lightThemeClasses
			: ''}
			{invalid ? 'border-2 border-red-500' : ''}
			"
	/>
</div>
