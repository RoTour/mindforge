<script lang="ts">
	import type { AddCss } from "$lib/utils/svelte.utils";

	type Props = {
		value: number;
    max: number;
		colors?: {
			bg?: string;
			indicator?: string;
		}
	} & AddCss;
	let { value, max, class: className, colors }: Props = $props();
  let fill: number = $derived((value * 100) / max)
</script>

<div class="w-full h-full {colors?.bg ?? 'bg-black'} relative rounded-full overflow-hidden {className}">
  <progress class="rounded-full hidden" {value} {max}></progress>
  <div class="{colors?.indicator ?? 'bg-primary-light'} absolute top-0 left-0 h-full w-full" style="width: {fill}%;"></div>
</div>
