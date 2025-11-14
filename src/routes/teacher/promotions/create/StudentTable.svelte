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
	import { Button } from '$lib/components/ui/button/index.js';
	import AutoGenerateEmailDialog from './AutoGenerateEmailDialog.svelte';
	import type { CreateStudentDTO } from '$quiz/student/application/dtos/StudentDTO';
	import { Plus } from 'lucide-svelte';
	import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

	type Props = {
		students: CreateStudentDTO[];
	};
	let { students }: Props = $props();

	let forceShowEmail = $state(false);
	const showEmail = $derived(students.some((s) => s.email) || forceShowEmail);

	let isModalOpen = $state(false);

	function addStudent() {
		if (students.length === 0) {
			students.push({
				id: new StudentId().id(),
				name: '',
				lastName: '',
				email: undefined
			});
			return;
		}

		const lastStudent = students[students.length - 1];
		if (lastStudent && (lastStudent.name.trim() !== '' || lastStudent.lastName?.trim() !== '')) {
			students.push({
				id: new StudentId().id(),
				name: '',
				lastName: '',
				email: undefined
			});
		}
	}
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
			<TableRow>
				<TableCell colspan={showEmail ? 3 : 2}>
					<Button variant="ghost" class="w-full" onclick={addStudent}>
						<Plus class="mr-2 h-4 w-4" />
						Add Student
					</Button>
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
</div>
