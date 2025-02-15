<script lang="ts">
	import Generator from '@modules/Learning/views/Generator/Generator.svelte';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<header class="flex items-center gap-4 bg-surface px-4">
	<a href="/" class="[&_svg]:2-12 [&_svg]:h-12">
		<ArrowLeft size="24" />
	</a>

	<h1 class="text-2xl font-bold">Generator</h1>
</header>
<main class="px-8 py-4">
	<Generator />
</main>
