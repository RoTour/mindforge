<script lang="ts">
	export let size = '12';
	export let className = '';
	let wrapperRef: HTMLDivElement;
	$: if (wrapperRef) {
		wrapperRef.style.setProperty('--icon-size', `${+size * 0.25}rem`);
		wrapperRef.querySelector('svg')?.style.setProperty('width', `${+size * 0.25}rem`);
		wrapperRef.querySelector('svg')?.style.setProperty('height', `${+size * 0.25}rem`);
	}
</script>

<div class="icon-wrapper {className}" bind:this={wrapperRef}>
	<slot />
</div>

<style>
	.icon-wrapper > :global(*) {
		width: var(--icon-size);
		height: var(--icon-size);
	}
</style>
