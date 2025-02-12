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
	<Button href={'/create-question'} primary class="m-auto max-w-[80%] font-bold">NEW</Button>
	<p class="mx-auto my-4 max-w-[80%] text-center text-2xl font-bold">No pending questions</p>
{/if}
