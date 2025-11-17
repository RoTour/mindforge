<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageProps } from './$types';
	import { EnrollToPromotionVM } from './EnrollToPromotionVM.svelte';

	let { data }: PageProps = $props();
	let promotion = $derived(data.promotion);

	let vm = new EnrollToPromotionVM();
</script>

{#if vm.step === 'enter name'}
	<Card.Root>
		<Card.Header>
			<Card.Title>Enter Your Name to Join {promotion.name}</Card.Title>
			<Card.Description>Please provide your name to enroll in this promotion.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={(e) => vm.handleNameSubmitted(e)} class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<label for="student-firstname" class="font-medium">Your Name</label>
					<input
						id="student-firstname"
						type="text"
						name="student-firstname"
						bind:value={vm.studentFirstName}
						class="input input-bordered w-full"
						required
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="student-lastname" class="font-medium">Your Name</label>
					<input
						id="student-lastname"
						type="text"
						name="student-lastname"
						bind:value={vm.studentLastName}
						class="input input-bordered w-full"
						required
					/>
				</div>
				<button type="submit" class="btn btn-primary">Check your place</button>
			</form>
		</Card.Content>
	</Card.Root>
{/if}

<h1>Join Promotion: {promotion.name}</h1>
