<script lang="ts">
	// /Users/rotour/projects/mindforge/src/lib/components/ImageUploader.svelte
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	type Props = {
		handleFileReady: (file: File) => void;
	};
	let { handleFileReady }: Props = $props();

	let previewUrl: string | null = $state(null);

	function handleFile(file: File | null | undefined) {
		console.debug('Handling file:', file);
		if (!file || !file.type.startsWith('image/')) {
			return;
		}

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		previewUrl = URL.createObjectURL(file);
		handleFileReady(file);
	}

	function handlePaste(event: ClipboardEvent) {
		const file = event.clipboardData?.files[0];
		handleFile(file);
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		handleFile(file);
	}
</script>

<div class="mx-auto w-full max-w-lg text-center">
	<Label
		for="image-upload"
		class="hover:border-primary flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
		onpaste={handlePaste}
	>
		{#if previewUrl}
			<img src={previewUrl} alt="Image preview" class="max-h-full max-w-full object-contain" />
		{:else}
			<div class="text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mx-auto mb-4 h-8 w-8"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" x2="12" y1="3" y2="15" />
				</svg>
				<p>Click to upload or paste an image</p>
				<p class="text-xs">PNG, JPG, etc.</p>
			</div>
		{/if}
	</Label>
	<Input
		id="image-upload"
		type="file"
		class="hidden"
		accept="image/*"
		onchange={handleFileSelect}
	/>
</div>
