<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group/index';
	import type { PromotionStudentDTO } from '$quiz/application/dtos/PromotionStudentDTO';
	import StudentRollCard from './StudentRollCard.svelte';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	type Props = {
		students: PromotionStudentDTO[];
	};
	const { students }: Props = $props();
	const displayedStudents = $derived(
		students.sort((a, b) => {
			if (a.lastName === b.lastName) {
				return a.firstName.localeCompare(b.firstName);
			}
			return a.lastName.localeCompare(b.lastName);
		})
	);
	let gridWidth = $state(5);

	function increaseGridWidth() {
		if (gridWidth < 10) {
			gridWidth += 1;
		}
	}

	function decreaseGridWidth() {
		if (gridWidth > 1) {
			gridWidth -= 1;
		}
	}
</script>

<section class="p-8">
	<ButtonGroup.Root class="ms-auto mb-4">
		<Button variant="outline" onclick={decreaseGridWidth}><Minus /></Button>
		<Button variant="outline" onclick={increaseGridWidth}><Plus /></Button>
	</ButtonGroup.Root>
	<main class="grid gap-4" style="grid-template-columns: repeat({gridWidth}, minmax(0, 1fr));">
		{#each displayedStudents as student (student.id)}
			<StudentRollCard {student} />
		{/each}
	</main>
</section>
