<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { CarouselTestimonial } from './carousel-testimonials.svelte';

	export type MarqueeTestimonialsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		testimonials: CarouselTestimonial[];
		/** The accessible name of the row of cards. Defaults to `Testimonials`. */
		label?: string;
		/** Pixels per second the row moves by itself. */
		speed?: number;
		/** Extra movement while the page scrolls: `1` is 1px per 1px scrolled. */
		scrub?: number;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Marquee from '$lib/components/marquee.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import TestimonialCard from '$lib/components/testimonial-card.svelte';

	let {
		testimonials,
		label = 'Testimonials',
		speed = 60,
		scrub = 0.5,
		fullScreen = false,
		id,
		class: className,
		...copy
	}: MarqueeTestimonialsProps = $props();
</script>

<section {id} class="marquee-testimonials {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="header"><SectionCopy layout="row" rowAlign="center" {...copy} /></div>

		<Marquee {label} {speed} {scrub} pauseOnHover class="reviews">
			<div class="cards">
				{#each testimonials as item, index (index)}
					<TestimonialCard {...item} />
				{/each}
			</div>
		</Marquee>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.marquee-testimonials {
		overflow-x: clip;
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 64px;
		padding-block: var(--section-space-start) var(--section-space-end);
	}

	.header {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	.inner :global(.reviews.marquee) {
		--gap: 24px;

		@include mixins.body;
		line-height: normal;
	}

	.cards {
		display: flex;
		gap: 24px;
		align-items: stretch;
		white-space: normal;
	}

	.cards :global(.testimonial-card) {
		flex: none;
		width: clamp(280px, 80vw, 440px);
	}
</style>
