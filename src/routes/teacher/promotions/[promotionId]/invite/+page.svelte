<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import { Loader2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { InviteVM } from './InviteVM.svelte';

	let { data }: { data: PageData } = $props();

	const vm = new InviteVM(data.user, data.promotionId);
</script>

<div class="container mx-auto p-4">
	<!-- Desktop Component -->
	<Card.Root class="hidden px-4 py-2 md:block">
		<Card.Header class="p-2 pb-4">
			<Card.Title class="text-2xl">Enroll Student</Card.Title>
			<Card.Description>
				User <strong>{data.user.firstName} {data.user.lastName}</strong> ({data.email}) wants to
				enroll in this promotion.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-2 pt-0">
			{#if vm.error}
				<div class="mb-4 rounded bg-red-100 p-2 text-red-700">
					{vm.error}
				</div>
			{/if}

			<h2 class="mb-4 text-lg font-semibold">Select the student to link:</h2>
			{#if data.unlinkedStudents.length === 0}
				<p>No unlinked students found in this promotion.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Last Name</Table.Head>
							<Table.Head class="text-right">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.unlinkedStudents as student (student.id)}
							<Table.Row>
								<Table.Cell>{student.name}</Table.Cell>
								<Table.Cell>{student.lastName}</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="outline"
										onclick={() => vm.linkStudent(student.id)}
										disabled={vm.isLinking || vm.isCreating}
									>
										{#if vm.isLinking}
											<Loader2 class="mr-2 h-4 w-4 animate-spin" />
										{/if}
										Link
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}

			<Separator class="mb-6" />

			<div>
				<h2 class="mb-2 text-lg font-semibold">Or, add as new student:</h2>
				<Button
					class="w-full sm:w-auto"
					onclick={() => vm.createAndLinkStudent()}
					disabled={vm.isLinking || vm.isCreating}
				>
					{#if vm.isCreating}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Add as New Student
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Mobile component -->
	<div class="flex flex-col gap-8 md:hidden">
		{#if vm.error}
			<div class="mb-4 rounded bg-red-100 p-2 text-red-700">
				{vm.error}
			</div>
		{/if}
		{#each data.unlinkedStudents as student (student.id)}
			<Card.Root>
				<Card.Header>
					<span class="font-semibold">{student.name} {student.lastName}</span>
				</Card.Header>
				<Card.Content class="flex flex-col space-y-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => vm.linkStudent(student.id)}
						disabled={vm.isLinking || vm.isCreating}
					>
						{#if vm.isLinking}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Link
					</Button>
				</Card.Content>
			</Card.Root>
		{/each}
		<Button
			variant="default"
			size="lg"
			onclick={() => vm.createAndLinkStudent()}
			disabled={vm.isLinking || vm.isCreating}
		>
			{#if vm.isCreating}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Register new student
		</Button>
	</div>
</div>
