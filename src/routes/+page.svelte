<script lang="ts">
	import { store } from '$lib/redux/store';
	import { QuestionBuilder } from '@modules/Learning/constructors/QuestionBuilder';
	import { questionCreated } from '@modules/Learning/events/QuestionActions';
	import { createQuestion } from '@modules/Learning/usecases/createQuestion';
	import Question from '@modules/Learning/views/Question.svelte';
	import { RuneStore } from '@redux/runesStore.svelte';
	import { onMount } from 'svelte';
	import { QuestionToUI } from '@modules/Learning/mappers/QuestionToUI';

	const runeStore = new RuneStore(store);
	const questions = $derived.by(() => {
		return Object.values(runeStore.state.questions).map(QuestionToUI);
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

<h1>MindForge</h1>
<main class="px-4 py-6">
  {#each questions as question}
    <Question question={question} />
  {/each}
</main>
