<script lang="ts">
	import type { PageProps } from './$types';
	import StudentRoll from './StudentRoll.svelte';

	let { data }: PageProps = $props();
</script>

<StudentRoll students={data.students} />
