<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import {
		Book,
		BrainCircuit,
		Code,
		Users,
		UsersRound,
		CheckCircle2,
		HelpCircle
	} from 'lucide-svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import Separator from '$lib/components/ui/separator/separator.svelte';

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
			<h1 class="text-2xl font-bold">Welcome back, John Doe!</h1>
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
							<p class="text-2xl font-bold">{data.summaryStats.nbPromotionsEnrolled}</p>
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
							<p class="text-2xl font-bold">{data.summaryStats.nbQuestionsAnswered}</p>
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
							<p class="text-2xl font-bold">{data.summaryStats.nbTotalQuestions}</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</header>

	<div class="mt-12">
		<h2 class="text-xl font-bold">My Promotions</h2>
		{#if promotions.length > 0}
			<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each promotions as promotion (promotion.id)}
					{@const icon = icons[promotion.name] || Book}
					<Card.Root class="flex flex-col">
						<Card.Header>
							<div class="flex items-center gap-4">
								<svelte:component this={icon} class="text-muted-foreground h-8 w-8" />
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
</section>
