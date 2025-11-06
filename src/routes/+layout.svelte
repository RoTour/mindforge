<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { page } from '$app/state';
	import '../app.css';
	import '../shadcn-theme.css';

	let { children } = $props();
	let onAuthPage = $derived(page.url.pathname.startsWith('/auth'));
</script>

{#if !onAuthPage}
	<Navbar />
{/if}
{@render children()}
