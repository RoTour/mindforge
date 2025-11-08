<!-- /src/quiz-context/views/dashboard/CreateQuestionForm.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CreateQuestionFormVM } from './CreateQuestionFormVM.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Trash2 } from 'lucide-svelte';

	const vm = new CreateQuestionFormVM();
</script>

<Card.Root class="h-fit w-full">
	<Card.Header>
		<Card.Title>Create a New Question</Card.Title>
		<Card.Description
			>Enter the text for your new question and add any key notions students should mention in their
			answer.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				vm.createQuestion();
			}}
			class="grid gap-6"
		>
			<div class="grid gap-2">
				<Label for="question-text" class="font-semibold">Question Text</Label>
				<Textarea
					id="question-text"
					placeholder="e.g., Explain the main benefits of Dependency Injection..."
					bind:value={vm.text}
					required
				/>
			</div>

			<div class="grid gap-4">
				<Label class="font-semibold">Key Notions (Optional)</Label>
				{#each vm.keyNotions as notion, i (i)}
					<div class="border-border flex items-start gap-2 rounded-md border p-3">
						<div class="grid flex-1 gap-2">
							<Input
								placeholder="Key Notion (e.g., Inversion of Control)"
								bind:value={notion.text}
							/>
							<Textarea
								placeholder="Optional: Description for the grader..."
								bind:value={notion.description}
								class="min-h-[60px]"
							/>
						</div>
						<Button variant="ghost" size="icon" type="button" onclick={() => vm.removeKeyNotion(i)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				<Button variant="secondary" type="button" onclick={vm.addEmptyKeyNotion}>
					+ Add Key Notion
				</Button>
			</div>

			{#if vm.error}
				<p class="text-destructive text-sm font-medium">{vm.error}</p>
			{/if}
			{#if vm.success}
				<p class="text-sm font-medium text-green-600">Question created successfully!</p>
			{/if}
			<Button type="submit" class="w-full" disabled={vm.isLoading}>
				{#if vm.isLoading}Loading...{:else}Create Question{/if}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
