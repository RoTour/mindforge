<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let promotions = $derived(data.promotions);
</script>

<section class="px-8 py-4">
	<h1>Promotions</h1>
	{#each promotions as promotion (promotion.id)}
		<Card.Root>
			<Card.Content>
				<div class="flex flex-col gap-2">
					<div class="truncate text-lg font-medium whitespace-nowrap">
						{promotion.name}
					</div>
					<!-- <div class="text-muted-foreground text-sm">ID: {displayedStudent.id}</div> -->
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</section>
