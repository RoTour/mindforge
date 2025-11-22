<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { AnswerListItem } from '$quiz/question-session/application/interfaces/ITeacherAnswersQueries';
	import { Loader2 } from 'lucide-svelte';
	import { GradingPanelVM } from './GradingPanelVM.svelte';

	let { answer, onGradeSaved }: { answer: AnswerListItem; onGradeSaved: () => void } = $props();

	const vm = new GradingPanelVM(answer, onGradeSaved);

	$effect(() => {
		vm.updateStateFromAnswer(answer);
	});
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>{answer.studentName}</Card.Title>
			<Card.Description>{answer.questionText}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="bg-muted rounded-md p-4">
				<p class="whitespace-pre-wrap">{answer.answerText}</p>
			</div>
			<div class="text-muted-foreground mt-2 text-xs">
				Submitted at {new Date(answer.submittedAt).toLocaleString()}
			</div>
		</Card.Content>
	</Card.Root>

	{#if answer.autoGrade}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title>Auto Grade</Card.Title>
					<Badge variant={answer.autoGrade.status === 'COMPLETED' ? 'default' : 'secondary'}>
						{answer.autoGrade.status}
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#if answer.autoGrade.status === 'COMPLETED'}
					<div>
						<Label>Skills Mastered</Label>
						<div class="mt-1 flex flex-wrap gap-2">
							{#each answer.autoGrade.skillsMastered as skill (skill)}
								<Badge
									variant="outline"
									class="border-green-200 bg-green-50 whitespace-normal text-green-700"
								>
									{skill}
								</Badge>
							{/each}
							{#if answer.autoGrade.skillsMastered.length === 0}
								<span class="text-muted-foreground text-sm">None</span>
							{/if}
						</div>
					</div>
					<div>
						<Label>Skills to Reinforce</Label>
						<div class="mt-1 flex flex-wrap gap-2">
							{#each answer.autoGrade.skillsToReinforce as skill (skill)}
								<Badge
									variant="outline"
									class="border-yellow-200 bg-yellow-50 whitespace-normal text-yellow-700"
								>
									{skill}
								</Badge>
							{/each}
							{#if answer.autoGrade.skillsToReinforce.length === 0}
								<span class="text-muted-foreground text-sm">None</span>
							{/if}
						</div>
					</div>
					{#if answer.autoGrade.comment}
						<div>
							<Label>Comment</Label>
							<p class="text-muted-foreground mt-1 text-sm">{answer.autoGrade.comment}</p>
						</div>
					{/if}
				{:else}
					<p class="text-muted-foreground text-sm">Auto-grading is pending or failed.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Teacher Grade</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-2">
				<Label for="skills-mastered">Skills Mastered (comma separated)</Label>
				<Textarea
					id="skills-mastered"
					bind:value={vm.skillsMastered}
					placeholder="e.g. React, TypeScript, State Management"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="skills-reinforce">Skills to Reinforce (comma separated)</Label>
				<Textarea
					id="skills-reinforce"
					bind:value={vm.skillsToReinforce}
					placeholder="e.g. Error Handling, Performance"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="comment">Comment</Label>
				<Textarea id="comment" bind:value={vm.comment} placeholder="Add your feedback here..." />
			</div>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-2">
			<Button onclick={() => vm.handleSave(false)} disabled={vm.isSaving} class="w-full">
				{#if vm.isSaving}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					Save Grade
				{/if}
			</Button>
			<Button
				variant="secondary"
				onclick={() => vm.handleSave(true)}
				disabled={vm.isSaving}
				class="w-full"
			>
				{#if vm.isSaving}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					Save and Publish
				{/if}
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
