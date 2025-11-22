<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		Book,
		BrainCircuit,
		CheckCircle2,
		Code,
		HelpCircle,
		Users,
		UsersRound
	} from 'lucide-svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let promotions = $derived(data.promotions);

	const icons: Record<string, ComponentType<SvelteComponent>> = {
		'Software Engineering': Code,
		'Data Structures': BrainCircuit,
		'Computer Networks': Book
	};
</script>

<section class="w-full space-y-6 px-8 py-4 lg:m-auto lg:w-5/6">
	<header>
		<div>
			<h1 class="text-2xl font-bold">Welcome back, {data.summaryStats?.fullName ?? 'Student'}!</h1>
			<p class="text-muted-foreground">
				Continue learning and master new subjects through interactive quizzes
			</p>
		</div>
		<div class="mt-8 flex items-center gap-4">
			<div class="grid w-full gap-4 sm:grid-cols-3">
				<Card.Root>
					<Card.Content class="flex h-full items-center">
						<div
							class="bg-secondary mr-4 flex aspect-square h-12 items-center justify-center rounded-md"
						>
							<UsersRound class="stroke-primary" />
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Groups joined</p>
							<p class="text-2xl font-bold">{data.summaryStats?.nbPromotionsEnrolled ?? 0}</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content class="flex h-full items-center">
						<div
							class="bg-secondary mr-4 flex aspect-square h-12 items-center justify-center rounded-md"
						>
							<CheckCircle2 class="stroke-primary" />
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Completed questions</p>
							<p class="text-2xl font-bold">{data.summaryStats?.nbQuestionsAnswered ?? 0}</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content class="flex h-full items-center">
						<div
							class="bg-secondary mr-4 flex aspect-square h-12 items-center justify-center rounded-md"
						>
							<HelpCircle class="stroke-primary" />
						</div>
						<div>
							<p class="text-muted-foreground text-sm font-medium">Total questions available</p>
							<p class="text-2xl font-bold">{data.summaryStats?.nbTotalQuestions ?? 0}</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</header>

	<div class="mt-12">
		<h2 class="text-xl font-bold">My Promotions</h2>
		{#if promotions && promotions.length > 0}
			<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each promotions as promotion (promotion.id)}
					{@const Icon = icons[promotion.name] || Book}
					<Card.Root class="flex flex-col">
						<Card.Header>
							<div class="flex items-center gap-4">
								<Icon class="text-muted-foreground h-8 w-8" />
								<div>
									<Card.Title>{promotion.name}</Card.Title>
									<Card.Description>{promotion.description}</Card.Description>
								</div>
							</div>
						</Card.Header>
						<Card.Content class="grow">
							<div class="mb-1 flex items-center justify-between">
								<span class="text-sm font-medium">Progress</span>
								<span class="text-muted-foreground text-sm">
									{promotion.progress.completed} / {promotion.progress.total}
								</span>
							</div>
							<Progress value={(promotion.progress.completed / promotion.progress.total) * 100} />
						</Card.Content>
						<Card.Footer class="-mt-2 flex flex-col">
							<Separator />
							<div class="mt-4 flex w-full items-center justify-between">
								<div class="flex items-center gap-2">
									<Users class="text-muted-foreground h-4 w-4" />
									<span class="font-bold">{promotion.studentCount}</span>
									<span class="text-muted-foreground text-sm">Students</span>
								</div>
								<Button
									href={resolve(`/students/promotion/${promotion.id}/lobby`)}
									class="w-fit px-4"
								>
									Join Lobby
								</Button>
							</div>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<div class="flex h-64 flex-col items-center justify-center">
				<p class="text-muted-foreground">You are not enrolled in any promotions yet.</p>
				<p class="text-muted-foreground">Ask your teacher for an enrollment link or code.</p>
			</div>
		{/if}
	</div>
	<div class="mt-12 grid gap-8 lg:grid-cols-2">
		<div>
			<h2 class="mb-4 text-xl font-bold">Last Graded Questions</h2>
			{#if data.lastGradedQuestions && data.lastGradedQuestions.length > 0}
				<div class="space-y-4">
					{#each data.lastGradedQuestions as question}
						<Card.Root>
							<Card.Header>
								<Card.Title class="text-base">{question.questionText}</Card.Title>
								<Card.Description>
									Submitted on {new Date(question.submittedAt).toLocaleDateString()}
								</Card.Description>
							</Card.Header>
							<Card.Content>
								{#if question.grade.skillsMastered.length > 0}
									<div class="mb-2">
										<span class="text-muted-foreground text-sm font-medium">Mastered:</span>
										<div class="mt-1 flex flex-wrap gap-2">
											{#each question.grade.skillsMastered as skill}
												<Badge
													variant="outline"
													class="border-green-200 bg-green-50 text-green-700"
												>
													{skill}
												</Badge>
											{/each}
										</div>
									</div>
								{/if}
								{#if question.grade.skillsToReinforce.length > 0}
									<div>
										<span class="text-muted-foreground text-sm font-medium">To Reinforce:</span>
										<div class="mt-1 flex flex-wrap gap-2">
											{#each question.grade.skillsToReinforce as skill}
												<Badge
													variant="outline"
													class="border-yellow-200 bg-yellow-50 text-yellow-700"
												>
													{skill}
												</Badge>
											{/each}
										</div>
									</div>
								{/if}
								{#if question.grade.comment}
									<div class="bg-muted mt-4 rounded-md p-3 text-sm italic">
										"{question.grade.comment}"
									</div>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground">No graded questions yet.</p>
			{/if}
		</div>

		<div class="space-y-8">
			<div>
				<h2 class="mb-4 text-xl font-bold">Skills Mastered</h2>
				{#if data.studentSkills && data.studentSkills.mastered.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each data.studentSkills.mastered as skill}
							<Badge variant="secondary" class="bg-green-100 text-green-800 hover:bg-green-100">
								{skill}
							</Badge>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground">Keep practicing to master skills!</p>
				{/if}
			</div>

			<div>
				<h2 class="mb-4 text-xl font-bold">Skills to Work On</h2>
				{#if data.studentSkills && data.studentSkills.toReinforce.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each data.studentSkills.toReinforce as skill}
							<Badge variant="secondary" class="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
								{skill}
							</Badge>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground">Great job! No specific skills to reinforce right now.</p>
				{/if}
			</div>
		</div>
	</div>
</section>
