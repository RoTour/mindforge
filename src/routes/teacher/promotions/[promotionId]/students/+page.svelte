<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import * as Table from '$lib/components/ui/table';
	import { Save, Trash2, X } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { StudentsViewModel } from './StudentsViewModel.svelte';

	import { formatRelativeTime } from '$lib/lib/utils';

	let { data }: PageProps = $props();
	const vm = new StudentsViewModel(data.students, data.promotionId);
</script>

<main class="flex w-full flex-col gap-6 px-4 md:w-4/6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Students</h1>
		<div class="flex items-center gap-4">
			{#if vm.selectedStudentIds.size > 0}
				<Button variant="destructive" onclick={() => vm.removeSelectedStudents()}>
					<Trash2 class="mr-2 h-4 w-4" />
					Remove ({vm.selectedStudentIds.size})
				</Button>
			{/if}
			<Button onclick={() => vm.startAddingStudent()}>Add Student</Button>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root class="">
			<Table.Header>
				<Table.Row>
					<Table.Head class="p-4">
						<Checkbox
							checked={vm.students.length > 0 && vm.selectedStudentIds.size === vm.students.length}
							onCheckedChange={(checked) => vm.toggleAll(!!checked)}
						/>
					</Table.Head>
					<Table.Head>Student</Table.Head>
					<Table.Head>Completion</Table.Head>
					<Table.Head class="hidden text-right md:table-cell">Last Connection</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each vm.students as student (student.id)}
					<Table.Row class="h-20">
						<Table.Cell class="pl-4">
							<Checkbox
								checked={vm.selectedStudentIds.has(student.id)}
								onCheckedChange={() => vm.toggleSelection(student.id)}
							/>
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col gap-1">
								<a
									href={resolve(`/teacher/promotions/${data.promotionId}/students/${student.id}`)}
									class="text-primary text-base font-medium"
								>
									{student.name}
									{student.lastname ?? ''}
								</a>
								<div class="text-muted-foreground text-sm">{student.email ?? 'No email'}</div>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex w-full max-w-[200px] flex-col gap-2">
								<div class="text-right text-sm font-medium">
									{student.stats.answered} / {student.stats.total}
								</div>
								<Progress
									value={student.stats.total > 0
										? (student.stats.answered / student.stats.total) * 100
										: 0}
									class="h-2"
								/>
							</div>
						</Table.Cell>
						<Table.Cell class="hidden text-right md:table-cell">
							{student.lastConnection ? formatRelativeTime(student.lastConnection) : 'Never'}
						</Table.Cell>
					</Table.Row>
				{/each}

				{#if vm.newStudent}
					<Table.Row class="h-20">
						<Table.Cell></Table.Cell>
						<Table.Cell>
							<div class="flex flex-col gap-2">
								<div class="flex gap-2">
									<Input
										placeholder="First Name"
										bind:value={vm.newStudent.firstName}
										class="h-9"
									/>
									<Input placeholder="Last Name" bind:value={vm.newStudent.lastName} class="h-9" />
								</div>
								<Input placeholder="Email" bind:value={vm.newStudent.email} class="h-9" />
							</div>
						</Table.Cell>
						<Table.Cell colspan={2}>
							<div class="flex justify-end gap-2">
								<Button size="sm" variant="ghost" onclick={() => vm.cancelAddingStudent()}>
									<X class="h-4 w-4" />
								</Button>
								<Button size="sm" onclick={() => vm.saveNewStudent()}>
									<Save class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</main>
