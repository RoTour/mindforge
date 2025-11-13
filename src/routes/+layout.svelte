<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { page } from '$app/state';
	import '../app.css';
	import '../shadcn-theme.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let onAuthPage = $derived(page.url.pathname.startsWith('/auth'));
</script>

{#if !onAuthPage}
	<Navbar userIsATeacher={data.userIsATeacher} />
{/if}
{@render children()}
