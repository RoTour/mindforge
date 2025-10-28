<script lang="ts">
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import { CreatePromotionVM } from './CreatePromotionVM.svelte';
	import StudentTable from './StudentTable.svelte';

	const vm = new CreatePromotionVM(true);
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-8 text-3xl font-bold">Create Promotion</h1>

	<h2 class="mb-4 text-xl font-semibold">1. Upload Student List</h2>
	<ImageUploader handleFileReady={vm.parsePromotionFromFile} />

	{#if vm.isLoading}
		<div class="p-8 text-center">
			<p>Analyzing image with AI, please wait...</p>
		</div>
	{/if}

	{#if vm.errorMessage}
		<div class="p-8 text-center text-red-500">
			<p>An error occurred: {vm.errorMessage}</p>
		</div>
	{/if}

	{#if vm.parsedStudents.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">
				2. Review Parsed Students ({vm.parsedStudents.length})
			</h2>
			<StudentTable students={vm.parsedStudents} />
		</div>
	{/if}
</div>
