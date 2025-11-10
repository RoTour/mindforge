<!-- /src/routes/teacher/promotions/[promotionId]/questions/+page.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import type { PageProps } from './$types';
	import { QuestionsPageVM } from './QuestionsPageVM.svelte';
	import QuestionPlanner from './QuestionPlanner.svelte';

	let { data, params }: PageProps = $props();
	const vm = new QuestionsPageVM({
		allQuestions: data.allQuestions,
		promotionId: params.promotionId,
		plannedQuestions: data.plannedQuestions
	});
	const KEY_NOTION_LIMIT = 5;

	function getOrdinalSuffix(day: number): string {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	function formatScheduleDate(date: Date | null): string {
		if (!date) return 'N/A';

		const day = date.getDate();
		const suffix = getOrdinalSuffix(day);
		const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
		const month = date.toLocaleDateString('en-US', { month: 'long' });
		const time = date
			.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			})
			.replace(' ', ''); // Remove space before AM/PM

		return `${weekday} ${day}${suffix}, ${month} ${time}`;
	}
</script>

<div class="w-full space-y-8 p-4 md:p-6 lg:w-3/5">
	<div class="space-y-2">
		<h1 class="text-2xl font-bold">Questions</h1>
		<p class="text-muted-foreground">
			Manage questions for this promotion or browse all your available questions.
		</p>
	</div>

	<Separator />

	<div class="custom-grid grid grid-cols-1 gap-8 lg:items-start">
		<!-- Planned Questions -->
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Planned Questions</h2>
			<div class="space-y-4">
				{#each vm.plannedQuestions as plannedQuestion (plannedQuestion.id)}
					<Card.Root>
						<Card.Header>
							<Card.Title>{plannedQuestion.text}</Card.Title>
							{#if plannedQuestion.startingOn}
								<Card.Description class="flex flex-col pt-1 text-xs">
									<p>
										<span class="font-bold">From:</span>
										{formatScheduleDate(plannedQuestion.startingOn)}
									</p>
									{#if plannedQuestion.endingOn}
										<p>
											<span class="font-bold">To:</span>
											{formatScheduleDate(plannedQuestion.endingOn)}
										</p>
									{/if}
								</Card.Description>
							{/if}
						</Card.Header>
						{#if plannedQuestion.keyNotions.length > 0}
							<Card.Content class="-mt-4 flex flex-wrap items-center gap-2">
								{@const displayNotions = plannedQuestion.keyNotions.slice(0, KEY_NOTION_LIMIT)}
								{@const remainingCount = plannedQuestion.keyNotions.length - KEY_NOTION_LIMIT}

								{#each displayNotions as notion (notion.text)}
									<Badge variant="secondary">{notion.text}</Badge>
								{/each}

								{#if remainingCount > 0}
									<HoverCard.Root openDelay={200}>
										<HoverCard.Trigger>
											<Badge variant="outline">+{remainingCount} more</Badge>
										</HoverCard.Trigger>
										<HoverCard.Content class="w-auto max-w-sm" side="top">
											<div class="flex flex-wrap gap-2">
												{#each plannedQuestion.keyNotions as notion (notion.text)}
													<Badge variant="secondary">{notion.text}</Badge>
												{/each}
											</div>
										</HoverCard.Content>
									</HoverCard.Root>
								{/if}
							</Card.Content>
						{/if}
						<Card.Footer class="flex justify-end">
							<QuestionPlanner
								initialStartingOn={plannedQuestion.startingOn}
								initialEndingOn={plannedQuestion.endingOn}
								onSubmit={(payload) => {
									vm.updatePlannedQuestions(
										plannedQuestion.id,
										plannedQuestion.questionId,
										payload.startingOn,
										payload.endingOn
									);
								}}
							>
								<Button variant="outline" size="sm">Edit schedule</Button>
							</QuestionPlanner>
						</Card.Footer>
					</Card.Root>
				{:else}
					<div
						class="border-border flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
					>
						<p class="text-muted-foreground">
							No questions have been planned for this promotion yet.
						</p>
					</div>
				{/each}
			</div>
		</div>

		<Separator orientation="vertical" class="w-fit place-self-center" />
		<!-- All Questions -->
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">All My Questions</h2>
			<div class="space-y-4">
				{#each vm.allQuestions as question (question.id)}
					<Card.Root>
						<Card.Header>
							<Card.Title>{question.text}</Card.Title>
						</Card.Header>
						{#if question.keyNotions.length > 0}
							<Card.Content class="-mt-4 flex flex-wrap items-center gap-2">
								{@const displayNotions = question.keyNotions.slice(0, KEY_NOTION_LIMIT)}
								{@const remainingCount = question.keyNotions.length - KEY_NOTION_LIMIT}

								{#each displayNotions as notion (notion.text)}
									<Badge variant="secondary">{notion.text}</Badge>
								{/each}

								{#if remainingCount > 0}
									<HoverCard.Root openDelay={200}>
										<HoverCard.Trigger>
											<Badge variant="outline">+{remainingCount} more</Badge>
										</HoverCard.Trigger>
										<HoverCard.Content class="w-auto max-w-sm" side="top">
											<div class="flex flex-wrap gap-2">
												{#each question.keyNotions as notion (notion.text)}
													<Badge variant="secondary">{notion.text}</Badge>
												{/each}
											</div>
										</HoverCard.Content>
									</HoverCard.Root>
								{/if}
							</Card.Content>
						{/if}
						<Card.Footer class="flex justify-end">
							<QuestionPlanner
								onSubmit={(payload) => {
									vm.planQuestionOnPromotion(question.id, payload.startingOn, payload.endingOn);
								}}
							>
								<Button size="sm">Use in this promotion</Button>
							</QuestionPlanner>
						</Card.Footer>
					</Card.Root>
				{:else}
					<div
						class="border-border flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
					>
						<p class="text-muted-foreground">You haven't created any questions yet.</p>
						<Button class="mt-4" size="sm">Create First Question</Button>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.custom-grid {
		@media (width >= 64rem /* 1024px */) {
			grid-template-columns: minmax(0, 1fr) min-content minmax(0, 1fr);
		}
	}
</style>
