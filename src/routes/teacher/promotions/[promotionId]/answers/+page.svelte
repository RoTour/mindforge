<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedQuestionId = $state<string>('all');

	// Extract unique questions for the filter
	let questions = $derived(
		Array.from(new Map(data.answers.map((a) => [a.questionId, a.questionText])).entries()).map(
			([id, text]) => ({ id, text })
		)
	);

	let filteredAnswers = $derived(
		selectedQuestionId === 'all'
			? data.answers
			: data.answers.filter((a) => a.questionId === selectedQuestionId)
	);

	function getStatusColor(status: string | undefined) {
		switch (status) {
			case 'COMPLETED':
				return 'bg-green-500';
			case 'FAILED':
				return 'bg-red-500';
			case 'PENDING':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Answer History</h1>
		<div class="w-[300px]">
			<Select.Root type="single" bind:value={selectedQuestionId}>
				<Select.Trigger>
					{selectedQuestionId === 'all'
						? 'All Questions'
						: (questions.find((q) => q.id === selectedQuestionId)?.text ?? 'Select Question')}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Questions</Select.Item>
					{#each questions as question}
						<Select.Item value={question.id}>{question.text}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Student</Table.Head>
					<Table.Head>Question</Table.Head>
					<Table.Head>Answer</Table.Head>
					<Table.Head>Submitted At</Table.Head>
					<Table.Head>Auto Grade</Table.Head>
					<Table.Head>Teacher Grade</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredAnswers as answer}
					<Table.Row>
						<Table.Cell class="font-medium">{answer.studentName}</Table.Cell>
						<Table.Cell>{answer.questionText}</Table.Cell>
						<Table.Cell class="max-w-[300px] truncate" title={answer.answerText}>
							{answer.answerText}
						</Table.Cell>
						<Table.Cell>
							{new Date(answer.submittedAt).toLocaleString()}
						</Table.Cell>
						<Table.Cell>
							{#if answer.autoGrade}
								<Badge class={getStatusColor(answer.autoGrade.status)}>
									{answer.autoGrade.status}
								</Badge>
							{:else}
								<span class="text-muted-foreground text-sm">N/A</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if answer.teacherGrade}
								<Badge variant="outline">Graded</Badge>
							{:else}
								<span class="text-muted-foreground text-sm">Not Graded</span>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
