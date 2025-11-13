<script lang="ts">
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { CreatePromotionVM } from './CreatePromotionVM.svelte';
	import StudentTable from './StudentTable.svelte';

	const vm = new CreatePromotionVM(false);
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

	{#if vm.students.length > 0}
		<div class="mt-8 space-y-8">
			<div>
				<h2 class="mb-4 text-xl font-semibold">
					2. Review Parsed Students ({vm.students.length})
				</h2>
				<StudentTable students={vm.students} />
			</div>

			<div>
				<h2 class="mb-4 text-xl font-semibold">3. Promotion Details</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<Label for="promotion-name">Promotion Name</Label>
						<Input
							id="promotion-name"
							placeholder="e.g., Computer Science 2025"
							bind:value={vm.promotionName}
						/>
					</div>
					<div>
						<Label for="base-year">Base Year</Label>
						<Input id="base-year" type="number" bind:value={vm.baseYear} />
					</div>
				</div>
			</div>

			<div class="flex justify-end">
				<Button onclick={vm.createPromotion}>Create Promotion</Button>
			</div>
		</div>
	{/if}
</div>
