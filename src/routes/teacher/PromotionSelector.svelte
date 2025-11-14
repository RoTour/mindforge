<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import type { TeacherPromotionsListItem } from '$quiz/promotion/application/interfaces/ITeacherPromotionsQueries';
	import { resolve } from '$app/paths';
	import { goto, invalidate } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import { page } from '$app/state';

	type Props = {
		promotions: TeacherPromotionsListItem[];
		selectedPromotion: TeacherPromotionsListItem | null;
	};
	let { promotions, selectedPromotion = $bindable() }: Props = $props();

	const switchPromotion = async (destPromotionId: string) => {
		const { pathname } = page.url;
		const { promotionId: currentPromotionId } = page.params;

		selectedPromotion = promotions.find((p) => p.id === destPromotionId) || null;
		if (currentPromotionId) {
			const newPathname = pathname.replace(currentPromotionId, destPromotionId);
			await goto(resolve(newPathname as '/teacher/promotions/${string}/...'));
			await invalidate('promotion:selected');
		} else {
			// Fallback or default behavior if not in a promotion-specific path
			await goto(resolve(`/teacher/promotions/${destPromotionId}/students`));
		}
	};
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<div
							class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
						>
							<GalleryVerticalEndIcon class="size-4" />
						</div>
						<div class="flex flex-col gap-0.5 leading-none">
							<span class="font-semibold">Promotion</span>
							<span class="">{selectedPromotion?.name}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="start">
				{#each promotions as promotion (promotion.id)}
					<DropdownMenu.Item onSelect={() => switchPromotion(promotion.id)}>
						{promotion?.name}
						{#if promotion.id === selectedPromotion?.id}
							<CheckIcon class="ml-auto" />
						{/if}
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Item onSelect={() => goto(resolve('/teacher/promotions/create'))}>
					<Plus />Create new promotion
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
