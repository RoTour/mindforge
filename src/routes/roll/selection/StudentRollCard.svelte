<script lang="ts">
	import type { PromotionStudentDTO } from '$quiz/application/dtos/PromotionStudentDTO';
	import * as Card from '$lib/components/ui/card/index';
	type Props = {
		student: PromotionStudentDTO;
	};
	const { student }: Props = $props();
	const displayedStudent = $derived({
		...student,
		id: `${student.id.split('-')[0]}-${student.id.split('-')[1]}`
	});
</script>

<Card.Root>
	<Card.Content>
		<div class="flex flex-col gap-2">
			<div class="truncate text-lg font-medium whitespace-nowrap">
				{displayedStudent.firstName}
				{displayedStudent.lastName}
			</div>
			<div class="text-muted-foreground text-sm">ID: {displayedStudent.id}</div>
		</div>
	</Card.Content>
</Card.Root>
