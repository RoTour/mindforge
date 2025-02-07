<script lang="ts">
	import { QuestionVM, type UIQuestion } from './QuestionVM.svelte';

	type Props = {
		question: UIQuestion;
	};
	let { question }: Props = $props();

	let vm = new QuestionVM(question);
</script>

<p>{vm.content}</p>
{#each vm.answers as answer}
  <button onclick={() => vm.toggleSelect(answer)}>{answer}</button>
{/each}
<button onclick={() => vm.answer()}>Submit</button>