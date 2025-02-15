<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/forms/Button.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import IconWrapper from '$lib/components/IconWrapper.svelte';
	import type { CreateQuestionDto } from '@modules/Learning/entities/Question';
	import { AlertTriangle, Check, Sparkles, Trash } from 'lucide-svelte';
	import { GeneratorVM } from './GeneratorVM.svelte';
	import { fly } from 'svelte/transition';
	import { vine } from 'sveltekit-superforms/adapters';

	const vm = new GeneratorVM($page);

  $inspect('INSPECT', vm.propositions);
</script>

{#if vm.generating}
	<p>Generating...</p>
{:else}
	<div class="flex flex-col">
		<Input label="Topic" name="topic" bind:value={vm.prompt} required class="bg-transparent" />
		<Button onclick={vm.startGeneration} class="flex w-fit gap-2">
			Generate
			<IconWrapper size="8">
				<Sparkles />
			</IconWrapper>
		</Button>
	</div>
{/if}

{#snippet proposition({ prompt, answer, options }: CreateQuestionDto)}
	<p class="text-justify"><strong class="bold mr-2">Prompt:</strong>{prompt}</p>
	<p><strong class="bold mr-2">Answer:</strong>{answer}</p>
	<p><strong class="bold mr-2">Options:</strong></p>
	<ul>
		{#each options ?? [] as option}
			<li>- {option}</li>
		{/each}
	</ul>
  <Button type="button" onclick={() => vm.removeProposition(prompt)} class="mt-8">
    <IconWrapper size="6">
      <Trash />
    </IconWrapper>
  </Button>
{/snippet}

{#if vm.propositions.length > 0 && vm.saving === false}
	<ul class="mb-16 mt-4 space-y-4">
		{#each vm.propositions as prop, idx}
			<li
				out:fly={{ x: 500, duration: 200 + idx * 100 }}
				class="rounded border-2 border-contrast-surface bg-surface p-4"
			>
				{@render proposition(prop)}
			</li>
		{/each}
	</ul>
	<div class="fixed bottom-4 right-1/2 w-full translate-x-1/2 px-8">
		<Button onclick={() => vm.saveAll()} type="button" class="flex gap-2">Save all</Button>
	</div>
{:else if vm.error}
	<p>{vm.error}</p>
{/if}

{#if vm.savingStatus === 'success'}
<div class="flex gap-2">
  <p>All Question saved !</p>
  <IconWrapper size="8">
    <Check />
  </IconWrapper>
</div>
{/if}

{#if vm.savingStatus === 'partial'}
  <p>Some questions could not be saved.</p>
  <IconWrapper size="8">
    <AlertTriangle />
  </IconWrapper>
{/if}

{#if vm.savingStatus === 'failed'}
  <p>{vm.error}</p>
  <IconWrapper size="8">
    <AlertTriangle />
  </IconWrapper>
{/if}