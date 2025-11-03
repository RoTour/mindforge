<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let promotion = $derived(data.promotion);
</script>

<h1>Join Promotion: {promotion.name}</h1>
