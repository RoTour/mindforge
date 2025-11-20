<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { history, promotionId } = $derived(data);
</script>

<main class="flex flex-col gap-6 px-4">
	<div class="flex items-center gap-4">
		<Button
			variant="ghost"
			href="/teacher/promotions/{promotionId}/students"
			class="text-muted-foreground hover:text-foreground"
		>
			&larr; Back to Students
		</Button>
		<h1 class="text-2xl font-bold">
			{history.student.name}
			{history.student.lastname ?? ''}
		</h1>
	</div>

	<div class="grid gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>Student Details</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-muted-foreground text-sm font-medium">Email</dt>
						<dd class="mt-1 text-sm">{history.student.email ?? 'N/A'}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground text-sm font-medium">Total Answers</dt>
						<dd class="mt-1 text-sm">{history.answers.length}</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Answer History</Card.Title>
			</Card.Header>
			<Card.Content class="p-0">
				{#if history.answers.length === 0}
					<div class="text-muted-foreground p-6 text-center">
						No answers found for this student.
					</div>
				{:else}
					<div class="divide-y">
						{#each history.answers as answer (answer.id)}
							<div class="p-6">
								<div class="mb-2 flex items-center justify-between">
									<span class="text-muted-foreground text-sm font-medium">
										{new Date(answer.submittedAt).toLocaleString()}
									</span>
									<Badge
										variant={answer.session.status === 'CLOSED'
											? 'default'
											: answer.session.status === 'ACTIVE'
												? 'secondary'
												: 'outline'}
									>
										{answer.session.status}
									</Badge>
								</div>
								<div class="mb-4">
									<h3 class="text-sm font-medium">Question</h3>
									<p class="text-muted-foreground mt-1">{answer.questionText}</p>
								</div>
								<div>
									<h3 class="text-sm font-medium">Answer</h3>
									<p class="mt-1 whitespace-pre-wrap">{answer.answerText}</p>
								</div>
								{#if answer.assessment}
									<div class="bg-muted mt-4 rounded-md p-4">
										<h3 class="text-sm font-medium">AI Assessment</h3>
										<p class="text-muted-foreground mt-1 text-sm">{answer.assessment}</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
