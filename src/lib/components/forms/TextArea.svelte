<script lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";

	type Props = {
		label: string;
		name: string;
		required?: boolean;
		value?: string;
		oninput?: (value: string) => void;
		class?: string;
		options?: HTMLTextareaAttributes;
	};

	let {
		label,
		name,
		required = false,
		value = '',
		oninput,
		class: className = '',
		options = {},
	}: Props = $props();
</script>

<div class="flex flex-col flex-1 {className}">
	<label for={name} class="block font-bold dark:text-zinc-300">
		{label}
	</label>
	<textarea
		{name}
		{required}
		{...options}
		oninput={(event) => oninput?.((event.target as HTMLTextAreaElement).value)}
		class="w-full px-4 py-2 text-black rounded-md focus-visible:outline-primary-dark"
	>{value}</textarea>
</div>
