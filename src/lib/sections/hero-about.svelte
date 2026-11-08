<script module lang="ts">
	import type { ComponentProps } from 'svelte';
	import type CtaGroup from '$lib/components/cta-group.svelte';

	export type HeroAboutProps = {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		title?: string;
		eyebrowText?: string;
		eyebrowIcon?: string;
		description?: string;
		/** A picture at the right, in line with the description, which then sits under the eyebrow. */
		image?: { src?: string; alt?: string };
		/** A button under the description. Shown with `image`. */
		cta?: ComponentProps<typeof CtaGroup>;
		/** `1` for a page's hero. `2` for a section further down the page, with the section spacing instead of the header clearance. */
		level?: 1 | 2;
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { headingReveal } from '$lib/attachments/text-reveal';
	import CtaGroupComponent from '$lib/components/cta-group.svelte';
	import EyebrowDescription from '$lib/components/eyebrow-description.svelte';
	import { imageProps } from '$lib/utils/image';
	import RichText from '$lib/components/rich-text.svelte';

	let {
		id,
		title,
		eyebrowText,
		eyebrowIcon,
		description,
		image,
		cta,
		level = 1,
		fullScreen = false,
		class: className
	}: HeroAboutProps = $props();
</script>

<section
	{id}
	class="hero-about {className ?? ''}"
	class:full-screen={fullScreen}
	class:section={level === 2}
>
	<div class="inner">
		{#if title}
			<svelte:element
				this={`h${level}`}
				data-reveal
				{@attach headingReveal(level === 1 ? {} : { delay: 0, once: false })}
			>
				<RichText text={title} />
			</svelte:element>
		{/if}
		{#if image?.src}
			<div class="split">
				<div class="copy">
					<EyebrowDescription {eyebrowText} {eyebrowIcon} {description} layout="stacked" />
					{#if cta?.primary?.text}<CtaGroupComponent {...cta} />{/if}
				</div>
				<img
					{...imageProps(image.src, { sizes: '(min-width: 768px) 50vw, 100vw' })}
					alt={image.alt ?? ''}
				/>
			</div>
		{:else}
			<EyebrowDescription {eyebrowText} {eyebrowIcon} {description} />
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-about {
		display: flex;
		flex-direction: column;
		padding-block: calc(var(--body-padding-double) + 96px) var(--body-padding);
	}

	.section {
		padding-block-start: var(--section-space-start);
		padding-block-end: max(var(--section-space-end), var(--body-padding));
	}

	.full-screen {
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 180px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	h1,
	h2 {
		margin: 0;
	}

	.copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-paragraph-cta-group);
	}

	.split {
		display: grid;
		gap: 48px;

		@include mixins.min-md {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
			gap: var(--body-padding);
		}
	}

	img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
		object-fit: cover;
	}
</style>
