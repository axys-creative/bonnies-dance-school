<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { CarouselTestimonial } from './carousel-testimonials.svelte';

	export type TestimonialsGridProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title' | 'description'
	> & {
		testimonials: CarouselTestimonial[];
		/** How many reviews show at first, and how many each press of the button adds. */
		pageSize?: number;
		/** The label of the button that shows more. */
		moreText?: string;
		/** The label of the button once everything shows. It goes back to the first page. */
		lessText?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the scroll animation, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { animate } from '$lib/attachments/animate';
	import { roll } from '$lib/attachments/roll';
	import Button from '$lib/components/button.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import TestimonialCard from '$lib/components/testimonial-card.svelte';

	let {
		testimonials,
		pageSize = 3,
		moreText = 'View more',
		lessText = 'Collapse',
		fullScreen = false,
		id,
		static: isStatic = false,
		class: className,
		...copy
	}: TestimonialsGridProps = $props();

	let extra = $state(0);
	const shown = $derived(pageSize + extra);
	let list = $state<HTMLElement>();
	let inner = $state<HTMLElement>();

	const visible = $derived(testimonials.slice(0, shown));
	const remaining = $derived(testimonials.length - visible.length);

	// Jumps up to the heading first, so the page never shows the end of a shorter page while it shrinks.
	function collapse() {
		inner?.scrollIntoView({ block: 'start' });
		extra = 0;
		refocus();
	}

	// The button is made again when its label changes, so the keyboard keeps its place.
	async function refocus() {
		await tick();
		if (document.activeElement === document.body) {
			inner?.querySelector<HTMLElement>('.more button')?.focus({ preventScroll: true });
		}
	}

	async function more() {
		const first = shown;
		extra += pageSize;
		await tick();
		refocus();
		if (isStatic || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// Cards already on screen play their entrance now; the rest wait for the scroll, as the first cards do.
		Array.from(list?.children ?? [])
			.slice(first)
			.forEach((card, index) => {
				if (card.getBoundingClientRect().top >= innerHeight) return;
				card.animate(
					[
						{ opacity: 0, translate: '0 24px' },
						{ opacity: 1, translate: '0 0' }
					],
					{
						duration: 700,
						delay: (index % 3) * 100,
						easing: 'cubic-bezier(0.18, 0.97, 0.47, 1)',
						fill: 'backwards'
					}
				);
			});
	}
</script>

<section {id} class="testimonials-grid {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner" bind:this={inner}>
		<SectionCopy {...copy} still={isStatic} />

		<ul class="grid" bind:this={list}>
			{#each visible as item, index (index)}
				<li {@attach isStatic ? undefined : animate({ delay: (index % 3) * 0.1 })}>
					<TestimonialCard {...item} />
				</li>
			{/each}
		</ul>

		<p class="visually-hidden" aria-live="polite">
			Showing {visible.length} of {testimonials.length} reviews
		</p>

		{#if testimonials.length > pageSize}
			<div class="more">
				{#key remaining > 0}
					<Button
						text={remaining > 0 ? moreText : lessText}
						type="solid"
						iconEnd={remaining > 0 ? 'arrow-down' : 'arrow-up'}
						onclick={remaining > 0 ? more : collapse}
						{@attach roll()}
					/>
				{/key}
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.testimonials-grid {
		padding-block: var(--section-space-start) var(--section-space-end);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		scroll-margin-block-start: 120px;
		display: flex;
		flex-direction: column;
		gap: 64px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	.grid {
		display: grid;
		gap: 24px;
		padding: 0;
		margin: 0;
		list-style: none;

		@include mixins.min-md {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@include mixins.min-lg {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		li {
			display: flex;
		}

		:global(.testimonial-card) {
			flex: 1;
		}
	}

	.more {
		display: flex;
		justify-content: center;
	}
</style>
