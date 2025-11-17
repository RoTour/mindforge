<script lang="ts">
	import type { PageProps } from './$types';
	import { EnrollToPromotionViewModel } from './EnrollToPromotionViewModel.svelte';

	let { data }: PageProps = $props();
	let promotion = $derived(data.promotion);

	const vm = new EnrollToPromotionViewModel(data);
</script>

<h1>Join Promotion: {promotion.name}</h1>
