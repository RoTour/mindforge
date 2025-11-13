<!-- @path: /Users/rotour/projects/mindforge/src/routes/students/promotion/[promotionId]/question/[questionId]/+page.svelte -->
<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { QuestionAnswerVM } from './QuestionAnswerVM.svelte';

	type Props = {
		data: {
			question: {
				id: string;
				text: string;
			};
			sessionId: string;
			promotionId: string;
		};
	};
	let { data }: Props = $props();

	const vm = new QuestionAnswerVM(data.promotionId, data.sessionId);

	function handleSubmit(event: Event) {
		event.preventDefault();
		vm.submitAnswer();
	}
</script>

<div class="container mx-auto flex h-full max-w-2xl items-center justify-center">
	<Card class="w-full">
		<CardHeader>
			<CardTitle>Question</CardTitle>
			<CardDescription>Read the question carefully and provide your answer below.</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-lg">{data.question.text}</p>
			<form onsubmit={handleSubmit}>
				<div class="grid w-full gap-2">
					<Label for="answer">Your Answer</Label>
					<Textarea
						id="answer"
						bind:value={vm.answer}
						placeholder="Type your answer here."
						disabled={vm.isSubmitting}
					/>
					{#if vm.error}
						<p class="text-destructive text-sm">{vm.error}</p>
					{/if}
					<Button type="submit" disabled={vm.isSubmitting}>
						{#if vm.isSubmitting}
							Submitting...
						{:else}
							Submit Answer
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
