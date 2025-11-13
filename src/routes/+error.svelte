<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { ArrowLeft } from 'lucide-svelte';
</script>

{#if page.status === 404}
	<Empty.Root>
		<Empty.Header>
			<Empty.Title>404 - Not Found</Empty.Title>
			<Empty.Description>
				The page you're looking for doesn't exist. Try searching for what you need below.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Empty.Description>
				<Button size="sm" href="/" variant="default" class="no-underline">
					<ArrowLeft class="mr-2" />
					Back to Home
				</Button>
			</Empty.Description>
		</Empty.Content>
	</Empty.Root>
{/if}
