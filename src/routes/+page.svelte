<script lang="ts">
	import { store } from '$lib/redux/store';
	import { QuestionBuilder } from '@modules/Learning/constructors/QuestionBuilder';
	import { questionCreated } from '@modules/Learning/events/QuestionActions';
	import { createQuestion } from '@modules/Learning/usecases/createQuestion';
	import { RuneStore } from '@redux/runesStore.svelte';
	import { onMount } from 'svelte';

	const runeStore = new RuneStore(store);
	const questions = $derived.by(() => {
		return Object.values(runeStore.state.questions);
	});

  onMount(() => {
		console.log('questions', questions);
		createQuestion({
			questionBuilder: (dto) => QuestionBuilder(dto).build(),
			callbacks: [
				(question) => console.log('created', question),
				(question) => store.dispatch(questionCreated(question))
			]
		}).execute({
			dto: {
				prompt: 'What is 1+1?',
				answer: '2',
				type: 'SIMPLE',
				options: ['1', '2', '3', '4']
			}
		});
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
{#each questions as question}
	<p>{question.prompt}</p>
	{#if question.options}
		{#each question.options as option}
			<p>{option}</p>
		{/each}
  {:else}
    <p>No options</p>
	{/if}
{/each}
