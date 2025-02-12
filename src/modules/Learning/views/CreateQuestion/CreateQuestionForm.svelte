<script lang="ts">
	import Button from '$lib/components/forms/Button.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import { QuestionAnswerSeparator, type Question } from '@modules/Learning/entities/Question';
	import { errorHandled } from '@modules/Stats/events/ErrorActions';
	import type { Store } from '@reduxjs/toolkit';
	import { Plus } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
  import { questionCreated } from '@modules/Learning/events/QuestionActions';

	let { data, store }: { data: any; store: Store } = $props();
	const { form, constraints, enhance } = superForm(data.form, {
		onError(event) {
			store.dispatch(
				errorHandled({
					message: event.result.error.message || 'Error creating question'
				})
			);
		},
		onResult(event) {
      checkedOptions = [];
      if (event.result.type !== "success") return;
      const question: Question = event.result.data?.form?.message?.question 
      store.dispatch(questionCreated(question));
		},
    
	});
	let checkedOptions: number[] = $state([]);
	let optionsValue = $derived($form.options);
	let answerValue = $derived($form.answer);
	let typeValue = $state('SIMPLE');

	const addOption = () => {
		const lastIsEmpty = $form.options[$form.options.length - 1] === '';
		if (lastIsEmpty) return;
		$form.options = [...$form.options, ''];
	};

	const updateAnswer = (event: { option: number; checked: boolean }) => {
		console.debug('Event', event);
		if (event.checked) return checkedOptions.push($form.options[event.option]);
		else return checkedOptions.splice(checkedOptions.indexOf(event.option), 1);
	};

	$effect(() => {
		$form.answer = checkedOptions.map(String).join(QuestionAnswerSeparator);
		setTimeout(() => {
			console.debug('Answer updated:', $form.answer);
		}, 0);
	});

	const answerContainsOption = (answer: string, option: string) =>
		answer.split(QuestionAnswerSeparator).includes(option) && option.trim() !== '';

	const isDuplicateOption = (option: string) => {
		return $form.options.filter((opt: string) => opt === option).length > 1;
	};
</script>

<form action="?/createQuestion" method="POST" class="p-4" use:enhance>
	<Input label="Prompt" name="prompt" bind:value={$form.prompt} {...$constraints.prompt} />

	<div class="mb-16">
		<div class="mt-4 grid grid-cols-[1fr_min-content] gap-y-4">
			<p class="mt-4 font-bold dark:text-contrast-background">Options</p>
			<p class="mt-4 whitespace-nowrap font-bold dark:text-contrast-background">Correct ?</p>
			<ul class="col-span-2 contents gap-y-4">
				{#each $form.options as _, i}
					{@const isChecked = answerContainsOption($form.answer, $form.options[i])}
					<li class="contents">
						<Input
							label=""
							bind:value={$form.options[i]}
							{...$constraints.options}
							invalid={isDuplicateOption($form.options[i])}
						/>
						<Checkbox
							label=""
							checked={isChecked}
							name="option-{i}"
							class="mx-auto"
							onclick={(e) => updateAnswer({ option: i, checked: e })}
						/>
					</li>
				{/each}
			</ul>
			<Button onclick={addOption} class="col-span-2 mt-4" type="button"><Plus />Add option</Button>
		</div>
	</div>

	<input type="hidden" name="options" value={optionsValue} />
	<input type="hidden" name="answer" value={answerValue} />
	<input type="hidden" name="type" value={typeValue} />

	<Button
		type="submit"
		class="fixed bottom-4 right-1/2 mt-auto w-[calc(100%-2rem)] translate-x-1/2 font-bold"
		primary>Create question</Button
	>
</form>
