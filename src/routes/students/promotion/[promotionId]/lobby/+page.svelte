<!-- @path: /Users/rotour/projects/mindforge/src/routes/students/promotion/[promotionId]/lobby/+page.svelte -->
<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Hourglass, CheckCircle, Lock, Clock } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';

	type Props = {
		data: {
			promotionId: string;
			lobbyData: {
				sessionId: string;
				endsAt: string;
				previousSlots: { order: number; questionId: string; answered: boolean }[];
				currentSlot: { order: number; questionId: string; answered: boolean } | null;
				hasNextQuestion: boolean;
			} | null;
		};
	};

	let { data }: Props = $props();

	$effect(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 5000); // Check every 5 seconds

		return () => clearInterval(interval);
	});
</script>

<div class="container mx-auto flex min-h-[calc(100vh-4rem)] items-start justify-center gap-8 p-4 md:items-center">
	<!-- Left side: Current question info -->
	<div class="flex flex-1 flex-col justify-center">
		{#if data.lobbyData?.currentSlot}
			{#if data.lobbyData.currentSlot.answered}
				<Card class="border-green-500/50 bg-green-500/5">
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-green-600">
							<CheckCircle class="h-6 w-6" />
							Answer Submitted
						</CardTitle>
						<CardDescription>
							You've answered question {data.lobbyData.currentSlot.order}. Wait for the teacher to unlock the next question.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-muted-foreground text-sm">
							{#if data.lobbyData.hasNextQuestion}
								More questions will be unlocked by your teacher.
							{:else}
								No more questions in this session.
							{/if}
						</p>
					</CardContent>
				</Card>
			{/if}
		{:else if !data.lobbyData}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Hourglass class="h-6 w-6" />
						Waiting Room
					</CardTitle>
					<CardDescription>
						No active session at the moment. Please wait for the teacher to start the session.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground text-sm">
						This page will automatically check for new questions.
					</p>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Clock class="h-6 w-6" />
						Session Active
					</CardTitle>
					<CardDescription>
						Waiting for the teacher to unlock the next question.
					</CardDescription>
				</CardHeader>
			</Card>
		{/if}
	</div>

	<!-- Right side: Question navigation (matching wireframe) -->
	<div class="flex w-64 flex-col gap-4">
		<!-- Previous answered questions -->
		{#if data.lobbyData?.previousSlots && data.lobbyData.previousSlots.length > 0}
			{#each data.lobbyData.previousSlots as slot}
				<Card class="border-muted bg-muted/20">
					<CardContent class="flex items-center justify-center py-4">
						<span class="text-muted-foreground text-sm">
							{#if slot.answered}
								Question {slot.order} answered
							{:else}
								Question {slot.order} missed
							{/if}
						</span>
					</CardContent>
				</Card>
			{/each}
		{/if}

		<!-- Current question -->
		{#if data.lobbyData?.currentSlot}
			<Card class="border-primary">
				<CardContent class="flex items-center justify-center py-6">
					<span class="font-medium">
						Current Question
					</span>
				</CardContent>
			</Card>
		{/if}

		<!-- Next question placeholder -->
		{#if data.lobbyData?.hasNextQuestion}
			<Card class="border-dashed border-muted-foreground/30">
				<CardContent class="flex items-center justify-center gap-2 py-4">
					<Lock class="text-muted-foreground h-4 w-4" />
					<span class="text-muted-foreground text-sm">Next Question</span>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

