<!-- @path: /Users/rotour/projects/mindforge/src/routes/students/promotion/[promotionId]/lobby/+page.svelte -->
<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Hourglass } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';

	$effect(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 10000); // Check every 10 seconds

		return () => clearInterval(interval);
	});
</script>

<div class="container mx-auto flex h-[calc(100vh-4rem)] max-w-2xl items-center justify-center p-4">
	<Card class="w-full justify-center text-center md:h-fit">
		<CardHeader>
			<CardTitle class="flex items-center justify-center gap-2">
				<Hourglass class="h-6 w-6" />
				Waiting Room
			</CardTitle>
			<CardDescription>
				You have answered all active questions. Please wait for the teacher to start the next one.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-muted-foreground text-sm">
				This page will automatically check for new questions.
			</p>
		</CardContent>
	</Card>
</div>
