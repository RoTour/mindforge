<script lang="ts">
	import SearchForm from './SearchForm.svelte';
	import PromotionSelector from './PromotionSelector.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import type { TeacherPromotionsListItem } from '$quiz/application/interfaces/ITeacherPromotionsQueries';
	import { resolve } from '$app/paths';

	let {
		ref = $bindable(null),
		promotions,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { promotions: TeacherPromotionsListItem[] } = $props();
	let selectedPromotion = $derived(promotions.at(0) ?? null);

	const data = $derived({
		navMain: [
			{
				title: 'Students',
				url: '#',
				shown: !!selectedPromotion,
				items: [
					{
						title: 'Students Overview',
						url: `promotions/${selectedPromotion?.id}/students`
					},
					{
						title: 'Project Structure',
						url: '#'
					}
				]
			}
		]
	} as const);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<PromotionSelector {promotions} />
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.navMain as group (group.title)}
			{#if group.shown}
				<Sidebar.Group>
					<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each group.items as item (item.title)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={item.isActive}>
										{#snippet child({ props })}
											<a href={item.url} {...props}>{item.title}</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/if}
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
