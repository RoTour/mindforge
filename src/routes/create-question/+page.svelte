<script lang="ts">
	import IconWrapper from '$lib/components/IconWrapper.svelte';
	import CreateQuestionForm from '@modules/Learning/views/CreateQuestion/CreateQuestionForm.svelte';
	import { store } from '@redux/store.js';
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props();
</script>

<div class="flex gap-4 items-center justify-center">
	<a href="/"><IconWrapper size="8"><ArrowLeft /></IconWrapper></a>
	<h1 class="py-8 text-center text-2xl font-bold">Create a new question</h1>
</div>

<CreateQuestionForm {data} {store} />
