<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { students } = $derived(data);
</script>

<main class="flex flex-col gap-4 px-4">
	{#each students as student (student.id)}
		<div>
			<p>{student.name} {student.lastname}</p>
		</div>
	{/each}
</main>
