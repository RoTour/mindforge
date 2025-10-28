<!-- /Users/rotour/projects/mindforge/src/routes/teacher/create-promotion/StudentTable.svelte -->
<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { StudentDTO } from '$quiz/application/dtos/StudentDTO';
	import { Button } from '$lib/components/ui/button/index.js';
	import AutoGenerateEmailDialog from './AutoGenerateEmailDialog.svelte';

	type Props = {
		students: StudentDTO[];
	};
	let { students }: Props = $props();

	let forceShowEmail = $state(false);
	const showEmail = $derived(students.some((s) => s.email) || forceShowEmail);

	let isModalOpen = $state(false);
</script>

<div class="mb-4 flex justify-end gap-2">
	{#if !showEmail}
		<Button variant="outline" size="sm" onclick={() => (forceShowEmail = true)}>
			+ Add Email Column
		</Button>
	{/if}
	{#if showEmail}
		<Button variant="outline" size="sm" onclick={() => (isModalOpen = true)}>
			Auto-generate Emails
		</Button>
	{/if}
</div>

<AutoGenerateEmailDialog bind:open={isModalOpen} {students} />

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>First Name</TableHead>
				<TableHead>Last Name</TableHead>
				{#if showEmail}
					<TableHead>Email</TableHead>
				{/if}
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each students as student (student.id)}
				<TableRow>
					<TableCell class="font-medium">
						<Input bind:value={student.name} />
					</TableCell>
					<TableCell>
						<Input bind:value={student.lastName} />
					</TableCell>
					{#if showEmail}
						<TableCell>
							<Input bind:value={student.email} placeholder="student@example.com" />
						</TableCell>
					{/if}
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
