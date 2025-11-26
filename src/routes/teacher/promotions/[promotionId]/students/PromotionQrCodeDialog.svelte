<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Download, QrCode } from 'lucide-svelte';
	import qrcode from 'qrcode-generator';

	type Props = {
		promotionId: string;
	};

	let { promotionId }: Props = $props();

	let qrCodeSvg = $state<string | null>(null);
	let enrollUrl = $derived(`${page.url.origin}/students/enroll/${promotionId}`);

	$effect(() => {
		if (enrollUrl) {
			const qr = qrcode(0, 'L');
			qr.addData(enrollUrl);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 4 });
		}
	});

	const downloadQrCode = () => {
		if (!qrCodeSvg) return;

		// Create a temporary link element
		const link = document.createElement('a');
		// Create a Blob from the SVG string
		const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);

		link.href = url;
		link.download = `promotion-${promotionId}-qrcode.svg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				<QrCode class="mr-2 h-4 w-4" />
				Show QR Code
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Enrollment QR Code</Dialog.Title>
			<Dialog.Description>Scan this QR code to enroll in the promotion.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col items-center justify-center p-4">
			{#if qrCodeSvg}
				<div class="rounded-lg bg-white p-4">
					{@html qrCodeSvg}
				</div>
			{/if}
			<div class="text-muted-foreground mt-4 text-center text-sm break-all">
				{enrollUrl}
			</div>
		</div>
		<Dialog.Footer class="sm:justify-center">
			<Button onclick={downloadQrCode} class="w-full sm:w-auto">
				<Download class="mr-2 h-4 w-4" />
				Download SVG
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
