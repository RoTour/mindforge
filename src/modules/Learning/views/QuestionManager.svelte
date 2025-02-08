<script lang="ts">
	import Question from './Question.svelte';
	import { QuestionManagerVM } from './QuestionManagerVM.svelte';

	const vm = new QuestionManagerVM();
</script>

{#each vm.pendingQuestions as question}
	<Question {question} />
{/each}