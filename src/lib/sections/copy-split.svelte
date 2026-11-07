<script module lang="ts">
	export type CopySplitProps = {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		eyebrowText?: string;
		eyebrowIcon?: string;
		description?: string;
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import EyebrowDescription from '$lib/components/eyebrow-description.svelte';

	let {
		id,
		eyebrowText,
		eyebrowIcon,
		description,
		fullScreen = false,
		class: className
	}: CopySplitProps = $props();
</script>

<section {id} class="copy-split {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<EyebrowDescription {eyebrowText} {eyebrowIcon} {description} />
	</div>
</section>

<style lang="scss">
	.copy-split {
		padding-block: var(--body-padding-double);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}
</style>
