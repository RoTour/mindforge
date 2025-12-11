<!-- src/routes/teacher/promotions/[promotionId]/sessions/+page.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Loader2, Play, Square, Unlock } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { SessionsPageVM } from './SessionsPageVM.svelte';

	let { data }: PageProps = $props();
	const vm = new SessionsPageVM(data.sessions);

	function getStatusBadge(status: 'PENDING' | 'ACTIVE' | 'CLOSED') {
		switch (status) {
			case 'PENDING':
				return { variant: 'secondary' as const, class: 'bg-yellow-100 text-yellow-800' };
			case 'ACTIVE':
				return { variant: 'secondary' as const, class: 'bg-green-100 text-green-800' };
			case 'CLOSED':
				return { variant: 'secondary' as const, class: 'bg-gray-100 text-gray-600' };
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="w-full space-y-6 p-4 md:p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Live Sessions</h1>
			<p class="text-muted-foreground">Manage active and upcoming question sessions.</p>
		</div>
	</div>

	<Separator />

	{#if vm.sessions.length === 0}
		<div
			class="border-border flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
		>
			<p class="text-muted-foreground">No sessions found for this promotion.</p>
			<p class="text-muted-foreground text-sm">Sessions are created when you plan questions.</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each vm.sessions as session (session.id)}
				{@const statusStyle = getStatusBadge(session.status)}
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<Badge variant={statusStyle.variant} class={statusStyle.class}>
								{session.status}
							</Badge>
							<span class="text-muted-foreground text-sm">
								{session.questionCount} question{session.questionCount !== 1 ? 's' : ''}
							</span>
						</div>
						<Card.Title class="text-lg">
							Session {formatDate(session.scheduledDate)}
						</Card.Title>
						<Card.Description>
							Ends: {formatDate(session.endsAt)}
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-3">
						<!-- Slots -->
						{#each session.slots as slot (slot.order)}
							<div
								class="flex items-center justify-between rounded-md border p-2 text-sm {slot.status ===
								'UNLOCKED'
									? 'border-green-300 bg-green-50'
									: slot.status === 'CLOSED'
										? 'bg-muted'
										: ''}"
							>
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground font-mono">#{slot.order}</span>
									<span class="max-w-[180px] truncate" title={slot.questionText}>
										{slot.questionText}
									</span>
								</div>
								<div class="flex items-center gap-2">
									<Badge variant="outline" class="text-xs">{slot.answerCount} answers</Badge>
									{#if session.status === 'ACTIVE' && slot.status === 'LOCKED'}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => vm.unlockSlot(session.id, slot.order)}
											disabled={vm.isLoading}
										>
											{#if vm.isLoading}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<Unlock class="h-4 w-4" />
											{/if}
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</Card.Content>
					<Card.Footer class="flex justify-end gap-2">
						{#if session.status === 'PENDING'}
							<Button
								variant="default"
								onclick={() => vm.startSession(session.id)}
								disabled={vm.isLoading}
							>
								{#if vm.isLoading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<Play class="mr-2 h-4 w-4" />
								{/if}
								Start Session
							</Button>
						{:else if session.status === 'ACTIVE'}
							<Button
								variant="destructive"
								onclick={() => vm.closeSession(session.id)}
								disabled={vm.isLoading}
							>
								{#if vm.isLoading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<Square class="mr-2 h-4 w-4" />
								{/if}
								Close Session
							</Button>
						{/if}
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
