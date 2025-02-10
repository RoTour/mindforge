<script lang="ts">
	import Question from './Question.svelte';
	import { QuestionManagerVM } from './QuestionManagerVM.svelte';

	const vm = new QuestionManagerVM();
</script>

{#each vm.pendingQuestions as question}
	<Question {question} />
{/each}
{#if vm.pendingQuestions.length === 0}
	<p class="mx-auto my-4 max-w-[80%] text-center text-2xl font-bold">No pending questions</p>
{/if}