<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let promotions = $derived(data.promotions);
</script>
