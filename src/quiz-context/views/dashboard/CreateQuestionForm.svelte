<!-- /src/quiz-context/views/dashboard/CreateQuestionForm.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CreateQuestionFormVM } from './CreateQuestionFormVM.svelte';

	const vm = new CreateQuestionFormVM();
</script>

<Card.Root class="h-fit w-full max-w-md">
	<Card.Header>
		<Card.Title>Create a New Question</Card.Title>
		<Card.Description>Enter the text for your new question below.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				vm.createQuestion();
			}}
			class="grid gap-4"
		>
			<div class="grid gap-2">
				<Label for="question-text">Question Text</Label>
				<Input
					id="question-text"
					placeholder="e.g., What is the capital of France?"
					bind:value={vm.text}
					required
				/>
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
