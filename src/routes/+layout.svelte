<script lang="ts">
	import NotificationManager from '$lib/components/notifications/NotificationManager.svelte';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { RuneStore } from '@redux/runesStore.svelte';
	import { store } from '@redux/store';
	import { notificationRemoved } from '@redux/InAppNotifications/InAppNotificationsSlice';
	import '../app.css';
	import { onMount } from 'svelte';
	import { AppOpened } from '@redux/AppLifecycle/AppActions';

	let { children } = $props();

	const runeStore = new RuneStore(store);
	const notifications = $derived.by(() => runeStore.state.inApp.notifications);

	const onNotificationRemoved = (id: string) => {
		store.dispatch(notificationRemoved(id));
	};

	onMount(() => {
		store.dispatch(AppOpened());
	});
</script>

<ParaglideJS {i18n}>
	<NotificationManager {notifications} notificationRemoved={onNotificationRemoved} />

	{@render children()}
</ParaglideJS>
