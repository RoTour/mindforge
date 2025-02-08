<!-- @module/Learning/views/Question.svelte -->
<script lang="ts">
	import Button from '$lib/components/forms/Button.svelte';
	import { store } from '@redux/store';
	import { QuestionVM, type UIQuestion } from './QuestionVM.svelte';
	import { errorHandled } from '@modules/Stats/events/ErrorActions';
	import { questionAnswered } from '../events/QuestionActions';

	type Props = {
		question: UIQuestion;
	};
	let { question }: Props = $props();
	let vm = new QuestionVM({
		question,
		reduxStore: store
	});
	$inspect('INSPECT', vm.propositionsSelection);
</script>

<p class="mx-auto my-4 max-w-[80%] text-center text-2xl font-bold">{vm.prompt}</p>
<ul class="space-y-4">
	{#each vm.options as option}
		<li>
			{#key vm.propositionsSelection.get(option)}
				<Button accent={vm.isOptionSelected(option)} onclick={() => vm.toggleSelect(option)}>
					{option}
				</Button>
			{/key}
		</li>
	{/each}
</ul>
<Button onclick={() => vm.submit()} class="mt-4 font-bold" primary>Submit</Button>
