<!-- src/routes/teacher/promotions/[promotionId]/sessions/+page.svelte -->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { createTRPC } from '$lib/trpc';
	import { ChevronDown, ChevronUp, Loader2, Play, Plus, Square, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Local UI state
	let isLoading = $state(false);
	let expandedSessionId: string | null = $state(null);
	let selectedSessionId: string | null = $state(null);

	// Dialog state
	let showNewSessionDialog = $state(false);
	let newSessionDate = $state('');
	let newSessionEndDate = $state('');

	// Reactive data from page load
	let sessions = $derived(data.sessions);
	let questions = $derived(data.questions);

	function toggleExpand(sessionId: string) {
		expandedSessionId = expandedSessionId === sessionId ? null : sessionId;
	}

	function selectSession(sessionId: string) {
		selectedSessionId = sessionId;
		expandedSessionId = sessionId;
	}

	async function handleCreateSession() {
		if (!newSessionDate || !newSessionEndDate) return;
		isLoading = true;
		try {
			await createTRPC().teacher.sessions.createSession.mutate({
				promotionId: data.promotionId,
				scheduledDate: new Date(newSessionDate),
				endsAt: new Date(newSessionEndDate)
			});
			toast.success('Session created');
			showNewSessionDialog = false;
			newSessionDate = '';
			newSessionEndDate = '';
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to create session');
		} finally {
			isLoading = false;
		}
	}

	async function addQuestionToSession(sessionId: string, questionId: string) {
		isLoading = true;
		try {
			await createTRPC().teacher.sessions.addQuestion.mutate({
				liveSessionId: sessionId,
				questionId
			});
			toast.success('Question added');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to add question');
		} finally {
			isLoading = false;
		}
	}

	async function removeQuestionFromSession(sessionId: string, slotOrder: number) {
		isLoading = true;
		try {
			await createTRPC().teacher.sessions.removeQuestion.mutate({
				liveSessionId: sessionId,
				slotOrder
			});
			toast.success('Question removed');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to remove question');
		} finally {
			isLoading = false;
		}
	}

	async function startSession(sessionId: string) {
		isLoading = true;
		try {
			await createTRPC().teacher.sessions.startSession.mutate({ liveSessionId: sessionId });
			toast.success('Session started');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to start session');
		} finally {
			isLoading = false;
		}
	}

	async function closeSession(sessionId: string) {
		isLoading = true;
		try {
			await createTRPC().teacher.sessions.closeSession.mutate({ liveSessionId: sessionId });
			toast.success('Session closed');
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Failed to close session');
		} finally {
			isLoading = false;
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function getStatusColor(status: 'PENDING' | 'ACTIVE' | 'CLOSED') {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'ACTIVE':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'CLOSED':
				return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
		}
	}
</script>

<div class="flex h-full gap-6 p-4 md:p-6">
	<!-- Left Panel: Sessions List (flexible, min 500px) -->
	<div class="flex min-w-[500px] flex-1 flex-col space-y-4 overflow-hidden">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold tracking-tight">Live Sessions</h2>
			<Button onclick={() => (showNewSessionDialog = true)} disabled={isLoading}>
				<Plus class="mr-2 h-4 w-4" />
				New Session
			</Button>
		</div>

		<Separator />

		<div class="flex-1 space-y-3 overflow-auto pr-2">
			{#if sessions.length === 0}
				<div
					class="border-border flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
				>
					<div class="bg-muted mb-4 rounded-full p-3">
						<Plus class="text-muted-foreground h-8 w-8" />
					</div>
					<h3 class="text-lg font-medium">No sessions yet</h3>
					<p class="text-muted-foreground mt-1 text-sm">
						Create a session and add questions from the bank.
					</p>
					<Button class="mt-4" onclick={() => (showNewSessionDialog = true)}>
						<Plus class="mr-2 h-4 w-4" />
						Create First Session
					</Button>
				</div>
			{:else}
				{#each sessions as session (session.id)}
					{@const isExpanded = expandedSessionId === session.id}
					{@const isSelected = selectedSessionId === session.id}
					<Card.Root
						class="cursor-pointer transition-all hover:shadow-md {isSelected
							? 'ring-primary shadow-md ring-2'
							: ''}"
						onclick={() => selectSession(session.id)}
					>
						<Card.Header class="pb-3">
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<Badge class={getStatusColor(session.status)}>{session.status}</Badge>
										<span class="text-muted-foreground text-sm">
											{session.questionCount} question{session.questionCount !== 1 ? 's' : ''}
										</span>
									</div>
									<Card.Title class="text-lg">
										{formatDate(session.scheduledDate)} — {formatDate(session.endsAt)}
									</Card.Title>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onclick={(e) => {
										e.stopPropagation();
										toggleExpand(session.id);
									}}
								>
									{#if isExpanded}
										<ChevronUp class="h-5 w-5" />
									{:else}
										<ChevronDown class="h-5 w-5" />
									{/if}
								</Button>
							</div>
						</Card.Header>

						{#if isExpanded}
							<Card.Content class="space-y-3 pt-0">
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground text-sm font-medium">Questions</p>
									{#if session.status === 'PENDING'}
										<Button
											variant="default"
											size="sm"
											onclick={(e) => {
												e.stopPropagation();
												startSession(session.id);
											}}
											disabled={isLoading || session.slots.length === 0}
										>
											{#if isLoading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{:else}<Play
													class="mr-2 h-4 w-4"
												/>{/if}
											Start Session
										</Button>
									{:else if session.status === 'ACTIVE'}
										<Button
											variant="destructive"
											size="sm"
											onclick={(e) => {
												e.stopPropagation();
												closeSession(session.id);
											}}
											disabled={isLoading}
										>
											{#if isLoading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{:else}<Square
													class="mr-2 h-4 w-4"
												/>{/if}
											Close Session
										</Button>
									{/if}
								</div>

								{#if session.slots.length === 0}
									<div
										class="bg-muted/50 flex items-center justify-center rounded-md border border-dashed p-6"
									>
										<p class="text-muted-foreground text-sm">
											Select this session and add questions from the bank →
										</p>
									</div>
								{:else}
									<div class="space-y-2">
										{#each session.slots as slot (slot.order)}
											<div
												class="bg-muted/30 flex items-center justify-between rounded-md border px-3 py-2"
											>
												<div class="flex min-w-0 items-center gap-3">
													<span
														class="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
													>
														{slot.order}
													</span>
													<span class="truncate text-sm" title={slot.questionText}>
														{slot.questionText}
													</span>
												</div>
												{#if session.status === 'PENDING'}
													<Button
														variant="ghost"
														size="icon"
														class="hover:bg-destructive/10 shrink-0"
														onclick={(e) => {
															e.stopPropagation();
															removeQuestionFromSession(session.id, slot.order);
														}}
														disabled={isLoading}
													>
														<Trash2 class="text-destructive h-4 w-4" />
													</Button>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</Card.Content>
						{/if}
					</Card.Root>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Vertical Divider -->
	<Separator orientation="vertical" class="h-full" />

	<!-- Right Panel: Question Bank (fixed 350px) -->
	<div class="flex w-[350px] shrink-0 flex-col space-y-4 overflow-hidden">
		<h2 class="text-2xl font-bold tracking-tight">Question Bank</h2>
		<Separator />

		<div class="flex-1 space-y-2 overflow-auto pr-2">
			{#if !selectedSessionId}
				<div
					class="bg-muted/50 flex min-h-[200px] flex-col items-center justify-center rounded-lg p-6 text-center"
				>
					<p class="text-muted-foreground text-sm">← Select a session to add questions</p>
				</div>
			{:else if questions.length === 0}
				<div
					class="bg-muted/50 flex min-h-[200px] flex-col items-center justify-center rounded-lg p-6 text-center"
				>
					<p class="text-muted-foreground text-sm">No questions in your bank yet</p>
				</div>
			{:else}
				{#each questions as question (question.id)}
					<Card.Root class="group relative transition-shadow hover:shadow-sm">
						<Card.Content class="p-4 pr-12">
							<p class="text-sm leading-relaxed">{question.text}</p>
							{#if question.keyNotions && question.keyNotions.length > 0}
								<div class="mt-2 flex flex-wrap gap-1">
									{#each question.keyNotions.slice(0, 3) as notion}
										<Badge variant="secondary" class="text-xs">{notion}</Badge>
									{/each}
									{#if question.keyNotions.length > 3}
										<Badge variant="outline" class="text-xs">
											+{question.keyNotions.length - 3}
										</Badge>
									{/if}
								</div>
							{/if}
						</Card.Content>
						<Button
							variant="secondary"
							size="icon"
							class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={() => addQuestionToSession(selectedSessionId!, question.id)}
							disabled={isLoading}
						>
							<Plus class="h-4 w-4" />
						</Button>
					</Card.Root>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- New Session Dialog -->
<Dialog.Root bind:open={showNewSessionDialog}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create New Session</Dialog.Title>
			<Dialog.Description>Schedule a new live session for your students.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="start">Start Date & Time</Label>
				<Input id="start" type="datetime-local" bind:value={newSessionDate} />
			</div>
			<div class="space-y-2">
				<Label for="end">End Date & Time</Label>
				<Input id="end" type="datetime-local" bind:value={newSessionEndDate} />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showNewSessionDialog = false)}>Cancel</Button>
			<Button
				onclick={handleCreateSession}
				disabled={!newSessionDate || !newSessionEndDate || isLoading}
			>
				{#if isLoading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{/if}
				Create Session
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
