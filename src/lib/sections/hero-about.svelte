<script module lang="ts">
	export type HeroAboutProps = {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		title?: string;
		eyebrowText?: string;
		eyebrowIcon?: string;
		description?: string;
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import EyebrowDescription from '$lib/components/eyebrow-description.svelte';
	import RichText from '$lib/components/rich-text.svelte';

	let {
		id,
		title,
		eyebrowText,
		eyebrowIcon,
		description,
		fullScreen = true,
		class: className
	}: HeroAboutProps = $props();
</script>

<section {id} class="hero-about {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		{#if title}<h1><RichText text={title} /></h1>{/if}
		<EyebrowDescription {eyebrowText} {eyebrowIcon} {description} />
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-about {
		display: flex;
		flex-direction: column;
		padding-block: var(--body-padding-double) var(--body-padding);
	}

	.full-screen {
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-between;
		gap: 64px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	h1 {
		@include mixins.heading(clamp(64px, 14vw, 200px), 0.95);

		margin: 0;
	}
</style>
