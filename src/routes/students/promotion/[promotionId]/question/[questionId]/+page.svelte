<!-- @path: /Users/rotour/projects/mindforge/src/routes/students/promotion/[promotionId]/question/[questionId]/+page.svelte -->
<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';

	type Props = {
		question: {
			id: string;
			text: string;
		};
	};
	let { question }: Props = $props();

	let answer = $state('');

	function handleSubmit(event: Event) {
		event.preventDefault();
		console.log('Submitting answer:', answer);
		// Here we would call a tRPC mutation to submit the answer
	}
</script>

<div class="container mx-auto flex h-full max-w-2xl items-center justify-center">
	<Card class="w-full">
		<CardHeader>
			<CardTitle>Question</CardTitle>
			<CardDescription>Read the question carefully and provide your answer below.</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-lg">{question.text}</p>
			<form onsubmit={handleSubmit}>
				<div class="grid w-full gap-2">
					<Label for="answer">Your Answer</Label>
					<Textarea id="answer" bind:value={answer} placeholder="Type your answer here." />
					<Button type="submit">Submit Answer</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
