<script lang="ts">
	import Button from '$lib/components/forms/Button.svelte';
	import Question from './Question.svelte';
	import { QuestionManagerVM } from './QuestionManagerVM.svelte';

	const vm = new QuestionManagerVM();
	$inspect('INSPECT', vm.displayedQuestion);
</script>

{#if vm.displayedQuestion}
	{#key vm.displayedQuestion.id}
		<Question question={vm.displayedQuestion} />
	{/key}
{:else}
	<div class="space-y-4">
		<Button href={'/create-question'} primary class="m-auto max-w-[80%] font-bold">NEW</Button>
		<Button href={'/generator'} primary class="m-auto max-w-[80%] font-bold">GENERATOR</Button>
		<p class="mx-auto my-4 max-w-[80%] text-center text-2xl font-bold">No pending questions</p>
		<p class="mx-auto my-4 max-w-[80%] text-xl ">Time before next question: </p>
		<p class="text-4xl font-black text-center grid grid-col-4">{vm.countdown.days}d {vm.countdown.hours}h {vm.countdown.minutes}m {vm.countdown.seconds}s</p>
	</div>
{/if}
