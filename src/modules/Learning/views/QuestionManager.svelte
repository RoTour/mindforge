<script lang="ts">
	import Button from '$lib/components/forms/Button.svelte';
	import Question from './Question.svelte';
	import { QuestionManagerVM } from './QuestionManagerVM.svelte';

	const vm = new QuestionManagerVM();
</script>

{#if vm.displayedQuestion}
	<Question question={vm.displayedQuestion} />
{:else}
	<Button href={'/create-question'} primary class='max-w-[80%] m-auto font-bold'>NEW</Button>
	<p class="mx-auto my-4 max-w-[80%] text-center text-2xl font-bold">No pending questions</p>
{/if}
