<!-- /src/routes/teacher/promotions/[promotionId]/questions/QuestionPlanner.svelte -->
<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { fromDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		onSubmit: (payload: { startingOn: Date; endingOn: Date }) => void;
		initialStartingOn?: Date | null;
		initialEndingOn?: Date | null;
		triggerVariant: 'outline' | 'default';
	};
	let {
		children,
		onSubmit,
		initialStartingOn,
		initialEndingOn,
		triggerVariant: variant
	}: Props = $props();

	let open = $state(false);

	// Helper functions to initialize state from props or defaults
	function getInitialDate(date: Date | null | undefined): DateValue {
		return date ? fromDate(date, getLocalTimeZone()) : today(getLocalTimeZone());
	}

	function getInitialTime(date: Date | null | undefined, defaultTime: string): string {
		// 'en-GB' locale is used to force HH:mm:ss format
		return date ? date.toLocaleTimeString('en-GB') : defaultTime;
	}

	// State for the start date-time picker, initialized from props or defaults
	let startOpen = $state(false);
	let startDate = $state<DateValue | undefined>(getInitialDate(initialStartingOn));
	let startTime = $state(getInitialTime(initialStartingOn, '10:00:00'));

	// State for the end date-time picker, initialized from props or defaults
	let endOpen = $state(false);
	let endDate = $state<DateValue | undefined>(getInitialDate(initialEndingOn));
	let endTime = $state(getInitialTime(initialEndingOn, '11:00:00'));

	// Effect to ensure end date is never before start date
	$effect(() => {
		if (startDate && endDate && endDate.compare(startDate) < 0) {
			endDate = startDate;
		}
	});

	function parseTime(timeStr: string): [number, number, number] {
		const [hours, minutes, seconds] = timeStr.split(':').map(Number);
		return [hours || 0, minutes || 0, seconds || 0];
	}

	function handleSubmit() {
		if (!startDate || !endDate) {
			// TODO: Add proper error handling/toast notification
			console.error('Start date and end date must be selected.');
			return;
		}

		const [startHours, startMinutes, startSeconds] = parseTime(startTime);
		const finalStartDate = new Date(
			startDate.year,
			startDate.month - 1,
			startDate.day,
			startHours,
			startMinutes,
			startSeconds
		);

		const [endHours, endMinutes, endSeconds] = parseTime(endTime);
		const finalEndDate = new Date(
			endDate.year,
			endDate.month - 1,
			endDate.day,
			endHours,
			endMinutes,
			endSeconds
		);

		if (finalEndDate <= finalStartDate) {
			// TODO: Add proper error handling/toast notification
			console.error('End date must be after the start date.');
			return;
		}

		onSubmit({ startingOn: finalStartDate, endingOn: finalEndDate });
		open = false; // Close the dialog on successful submission
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="{buttonVariants({ variant: variant })}}">
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[650px]">
		<Dialog.Header>
			<Dialog.Title>Plan Question</Dialog.Title>
			<Dialog.Description>
				Select a start and end date for this question to be active in the promotion.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-1 gap-8 py-4">
			<!-- Start Date-Time Picker -->
			<div class="space-y-3">
				<h3 class="font-semibold">Make question available from</h3>
				<div class="flex items-end gap-2">
					<div class="flex flex-col gap-2">
						<Label for="start-date" class="px-1">Date</Label>
						<Popover.Root bind:open={startOpen}>
							<Popover.Trigger
								class="{buttonVariants({ variant: 'outline' })} w-40 justify-between font-normal"
							>
								{startDate
									? startDate.toDate(getLocalTimeZone()).toLocaleDateString('en-GB')
									: 'Select date'}
								<ChevronDown class="h-4 w-4" />
							</Popover.Trigger>
							<Popover.Content class="w-auto overflow-hidden p-0" align="start">
								<Calendar
									type="single"
									bind:value={startDate}
									onValueChange={() => {
										startOpen = false;
									}}
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
					<div class="flex flex-col gap-2">
						<Label for="start-time" class="px-1">Time</Label>
						<Input type="time" id="start-time" step="1" bind:value={startTime} />
					</div>
				</div>
			</div>

			<!-- End Date-Time Picker -->
			<div class="space-y-3">
				<h3 class="font-semibold">Until</h3>
				<div class="flex items-end gap-2">
					<div class="flex flex-col gap-2">
						<Label for="end-date" class="px-1">Date</Label>
						<Popover.Root bind:open={endOpen}>
							<Popover.Trigger
								class="{buttonVariants({ variant: 'outline' })} w-40 justify-between font-normal"
							>
								{endDate
									? endDate.toDate(getLocalTimeZone()).toLocaleDateString('en-GB')
									: 'Select date'}
								<ChevronDown class="h-4 w-4" />
							</Popover.Trigger>
							<Popover.Content class="w-auto overflow-hidden p-0" align="start">
								<Calendar
									type="single"
									bind:value={endDate}
									minValue={startDate}
									onValueChange={() => {
										endOpen = false;
									}}
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
					<div class="flex flex-col gap-2">
						<Label for="end-time" class="px-1">Time</Label>
						<Input type="time" id="end-time" step="1" bind:value={endTime} />
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
			<Button onclick={handleSubmit}>Plan Question</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
