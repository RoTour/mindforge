<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { TeacherPromotionsListItem } from '$quiz/promotion/application/interfaces/ITeacherPromotionsQueries';
	import type { ComponentProps } from 'svelte';
	import PromotionSelector from './PromotionSelector.svelte';
	import SearchForm from './SearchForm.svelte';
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
				shown: !!selectedPromotion,
				items: [
					{
						title: 'Students Overview',
						url: `/teacher/promotions/${selectedPromotion?.id}/students`
					},
					{
						title: 'Answer History',
						url: `/teacher/promotions/${selectedPromotion?.id}/answers`
					}
				]
			},
			{
				title: 'Questions',
				shown: !!selectedPromotion,
				items: [
					{
						title: 'Manage Questions',
						url: `/teacher/promotions/${selectedPromotion?.id}/questions`
					},
					{
						title: 'Add Questions',
						url: `/teacher/promotions/${selectedPromotion?.id}/questions/add`
					}
				]
			}
		]
	} as const);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<PromotionSelector {promotions} {selectedPromotion} />
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
									<Sidebar.MenuButton isActive={page.url.pathname === item.url}>
										{#snippet child({ props })}
											<a href={resolve(item.url)} {...props}>{item.title}</a>
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
