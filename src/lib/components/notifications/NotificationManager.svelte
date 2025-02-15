<script lang="ts">
	import type { InAppNotification } from '@redux/InAppNotifications/InAppNotificationsSlice';
	import { elasticIn, elasticOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	type Props = {
		notifications: InAppNotification[];
		notificationRemoved: (id: string) => void;
	};

	let { notifications = [], notificationRemoved }: Props = $props();
	let displayedNotifications: InAppNotification[] = $derived(notifications.slice(-3).toReversed()); // 3 lasts
	const removeNotification = (id: string) => {
		notifications = notifications.filter((n) => n.id !== id);
		notificationRemoved(id);
	};
</script>

{#snippet Notification({ id, message, type }: InAppNotification)}
	<div
		class="
    relative w-full rounded-md px-4
    py-2
    {type === 'error' ? 'bg-error text-contrast-error' : 'bg-success text-contrast-success'}
    "
	>
		<p class="message">{message}</p>
		<button class="absolute right-0 top-0 mx-4 my-2" onclick={() => removeNotification(id)}
			>X</button
		>
	</div>
{/snippet}

{#if displayedNotifications.length > 0}
	<ul class="fixed left-0 top-0 w-full space-y-2 px-8 py-4">
		{#each displayedNotifications as notification}
			<li in:fly={{ y: -20, duration: 700, easing: elasticOut }}>
				{@render Notification(notification)}
			</li>
		{/each}
	</ul>
{/if}
