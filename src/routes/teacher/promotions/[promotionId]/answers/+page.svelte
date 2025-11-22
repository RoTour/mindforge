<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	// Keep ScrollArea for the table if needed, but it's removed in the instruction. Let's remove it.
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Table from '$lib/components/ui/table';
	import { createTRPC } from '$lib/trpc';
	import type { AnswerListItem } from '$quiz/question-session/application/interfaces/ITeacherAnswersQueries';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import GradingPanel from './GradingPanel.svelte';

	let { data }: { data: PageData } = $props();

	let selectedQuestionId = $state<string>('all');
	let selectedAnswer = $state<AnswerListItem | null>(null);
	let isSheetUserOpen = $state(false);

	// Extract unique questions for the filter
	let questions: { id: string; text: string }[] = $derived(
		Array.from(
			new Map<string, string>(
				data.answers.map((a: AnswerListItem) => [a.questionId, a.questionText])
			).entries()
		).map(([id, text]) => ({ id, text }))
	);

	let filteredAnswers = $derived(
		selectedQuestionId === 'all'
			? data.answers
			: data.answers.filter((a: AnswerListItem) => a.questionId === selectedQuestionId)
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

	function handleAnswerClick(answer: AnswerListItem) {
		selectedAnswer = answer;
		isSheetUserOpen = true;
	}

	function handleGradeSaved() {
		invalidateAll();
	}

	function handlePrevious() {
		if (!selectedAnswer) return;
		const currentIndex = filteredAnswers.findIndex(
			(a: AnswerListItem) =>
				a.studentId === selectedAnswer?.studentId && a.questionId === selectedAnswer?.questionId
		);
		if (currentIndex > 0) {
			selectedAnswer = filteredAnswers[currentIndex - 1];
		}
	}

	function handleNext() {
		if (!selectedAnswer) return;
		const currentIndex = filteredAnswers.findIndex(
			(a: AnswerListItem) =>
				a.studentId === selectedAnswer?.studentId && a.questionId === selectedAnswer?.questionId
		);
		if (currentIndex < filteredAnswers.length - 1) {
			selectedAnswer = filteredAnswers[currentIndex + 1];
		}
	}

	let canGoPrevious = $derived.by(() => {
		if (!selectedAnswer) return false;
		const currentIndex = filteredAnswers.findIndex(
			(a: AnswerListItem) =>
				a.studentId === selectedAnswer?.studentId && a.questionId === selectedAnswer?.questionId
		);
		return currentIndex > 0;
	});

	let canGoNext = $derived.by(() => {
		if (!selectedAnswer) return false;
		const currentIndex = filteredAnswers.findIndex(
			(a: AnswerListItem) =>
				a.studentId === selectedAnswer?.studentId && a.questionId === selectedAnswer?.questionId
		);
		return currentIndex < filteredAnswers.length - 1;
	});

	async function handlePublish(answer: AnswerListItem) {
		const trpc = createTRPC();
		try {
			await trpc.teacher.answers.publishGrade.mutate({
				questionSessionId: answer.questionSessionId,
				studentId: answer.studentId
			});
			toast.success('Grade published');
			invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to publish grade');
		}
	}
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Answer History</h1>
		<div class="">
			<Select.Root type="single" bind:value={selectedQuestionId}>
				<Select.Trigger>
					{selectedQuestionId === 'all'
						? 'All Questions'
						: (questions.find((q) => q.id === selectedQuestionId)?.text ?? 'Select Question')}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Questions</Select.Item>
					{#each questions as question (question.id)}
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
					<Table.Head>Published</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredAnswers as answer, idx (idx)}
					<Table.Row
						class="hover:bg-muted/50 cursor-pointer"
						onclick={() => handleAnswerClick(answer)}
					>
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
						<Table.Cell>
							{#if answer.isPublished}
								<Badge variant="secondary" class="bg-green-100 text-green-800 hover:bg-green-100">
									Published
								</Badge>
							{:else}
								<Button
									variant="ghost"
									size="sm"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										handlePublish(answer);
									}}
								>
									Publish
								</Button>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<Sheet.Root bind:open={isSheetUserOpen}>
		<Sheet.Content
			class="w-full overflow-y-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl"
		>
			<Sheet.Header>
				<Sheet.Title>Grade Answer</Sheet.Title>
				<Sheet.Description>Review and grade the student's answer.</Sheet.Description>
			</Sheet.Header>
			<div class="mt-0 flex w-full flex-row justify-between px-4 sm:justify-between">
				<Button variant="outline" onclick={handlePrevious} disabled={!canGoPrevious}>
					<ChevronLeft class="h-4 w-4" />
					Previous
				</Button>
				<Button variant="outline" onclick={handleNext} disabled={!canGoNext}>
					Next
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
			<div class="flex-1">
				{#if selectedAnswer}
					<GradingPanel answer={selectedAnswer} onGradeSaved={handleGradeSaved} />
				{/if}
			</div>
			<Sheet.Footer class="mt-6 flex-row justify-between sm:justify-between"></Sheet.Footer>
		</Sheet.Content>
	</Sheet.Root>
</div>
