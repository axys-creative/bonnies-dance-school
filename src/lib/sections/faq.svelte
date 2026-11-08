<script module lang="ts">
	import type { AccordionItem } from '$lib/components/accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type FaqProps = {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		eyebrowText?: string;
		eyebrowIcon?: string;
		title?: string;
		description?: SectionCopyProps['description'];
		items?: AccordionItem[];
		/** At least the height of the screen, content centered. */
		fullScreen?: boolean;
		/** Skips the title's scroll reveal, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Accordion from '$lib/components/accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		id,
		eyebrowText,
		eyebrowIcon,
		title,
		description,
		items = [],
		fullScreen = false,
		static: isStatic = false,
		class: className
	}: FaqProps = $props();
</script>

<section {id} class="faq {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy {eyebrowText} {eyebrowIcon} {title} {description} still={isStatic} />
		{#if items.length}
			<Accordion {items} plus singleOpen highlight />
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.faq {
		padding-block-start: var(--section-space-start);
		padding-block-end: var(--section-space-end);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: grid;
		gap: 48px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;

		@include mixins.min-lg {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
			gap: var(--body-padding);
		}
	}
</style>
