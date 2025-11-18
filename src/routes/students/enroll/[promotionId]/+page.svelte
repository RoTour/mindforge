<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { Label } from '$lib/components/ui/label';
	import { AlertCircle } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';
	import { EnrollToPromotionVM } from './EnrollToPromotionVM.svelte';

	let { data }: PageProps = $props();
	const promotion = data.promotion;

	const vm = new EnrollToPromotionVM({ promotion });

	onDestroy(() => {
		vm.dispose();
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Card class="w-[450px]">
		<CardHeader>
			<CardTitle>Join Promotion</CardTitle>
			<CardDescription>{vm.promotion.name}</CardDescription>
		</CardHeader>
		<CardContent>
			{#if vm.authStep === 'enter email'}
				<form onsubmit={vm.onJoinPromotion}>
					<div class="grid w-full items-center gap-4">
						<div class="flex flex-col space-y-1.5">
							<Label for="email">Enter your school email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email to join"
								bind:value={vm.inputEmail}
								required
							/>
						</div>
					</div>
				</form>
			{/if}

			{#if vm.authStep === 'student found'}
				<div class="flex flex-col items-center justify-center gap-4 text-center">
					<p class="text-muted-foreground text-sm">
						We've sent a one-time password to {vm.inputEmail}. Please enter it below.
					</p>
					<InputOTP.Root bind:value={vm.otp} maxlength={6}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells.slice(0, 3) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
							<InputOTP.Separator />
							<InputOTP.Group>
								{#each cells.slice(3, 6) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
			{/if}

			{#if vm.authStep === 'student not found'}
				<div class="flex flex-col gap-4">
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertTitle>Student not found</AlertTitle>
						<AlertDescription>
							We couldn't find a student with the email <strong>{vm.inputEmail}</strong>.
						</AlertDescription>
					</Alert>

					<p class="text-muted-foreground text-sm">
						If you made a mistake, you can go back and edit your email. Otherwise, please enter your
						first and last name for manual verification by your teacher.
					</p>

					<div class="grid gap-2">
						<Label for="firstName">First Name</Label>
						<Input
							id="firstName"
							bind:value={vm.inputFirstName}
							placeholder="Enter your first name"
						/>
					</div>
					<div class="grid gap-2">
						<Label for="lastName">Last Name</Label>
						<Input id="lastName" bind:value={vm.inputLastName} placeholder="Enter your last name" />
					</div>
				</div>
			{/if}

			{#if vm.authStep === 'enrolled'}
				<p>
					Congratulations! You have successfully enrolled in the promotion: {vm.promotion.name}.
				</p>
			{/if}
		</CardContent>
		<CardFooter class="flex justify-between">
			{#if vm.authStep === 'enter email'}
				<Button onclick={vm.onJoinPromotion} class="w-full">Join Promotion</Button>
			{/if}
			{#if vm.authStep === 'student found'}
				<Button onclick={vm.onVerifyOtp} disabled={vm.otp.length < 6} class="w-full">Verify</Button>
			{/if}
			{#if vm.authStep === 'student not found'}
				<Button variant="outline" onclick={vm.backToEmailStep}>Edit Email</Button>
				<Button onclick={vm.onEnterName}>Request Verification</Button>
			{/if}
		</CardFooter>
	</Card>
</div>
