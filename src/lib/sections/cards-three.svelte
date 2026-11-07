<script module lang="ts">
	export type CardsThreeProps = Pick<SectionCopyProps, 'eyebrowText' | 'eyebrowIcon' | 'title'> & {
		/** Up to three cards, side by side from `md`. */
		cards: { icon?: string; title: string; description?: string }[];
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the entrance animation, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import type { Attachment } from 'svelte/attachments';
	import { animate } from '$lib/attachments/animate';
	import Icon from '$lib/components/icon.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import Tag from '$lib/components/tag.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { loadGsap } from '$lib/utils/gsap';
	import { onMount } from 'svelte';

	let {
		cards,
		fullScreen = false,
		id,
		static: isStatic = false,
		class: className,
		...copy
	}: CardsThreeProps = $props();

	const markers = false;
	const distance = 160;
	const step = 80;
	const spread = 100;
	const startSpread = 30;
	const extend = 240;
	const lift = -0.1;

	const themes = ['theme-light', 'theme-dark', 'theme-dark'];

	const query = '(min-width: 768px)';
	let desktop = $state(browser && matchMedia(query).matches);

	onMount(() => {
		const media = matchMedia(query);
		const update = () => (desktop = media.matches);
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

	// The cards rise into place as the row scrolls in, the later ones from further down, so they trail the first.
	const rise: Attachment<HTMLElement> = (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled) return;
			const context = gsap.context(() => {
				Array.from(el.children).forEach((card, index) => {
					const shift = (el.children.length - 1 - index) * spread - extend;
					gsap.from(card, {
						y: distance + index * step,
						ease: 'elastic.out(1, 0.75)',
						scrollTrigger: {
							trigger: el,
							start: () => `top ${innerHeight * 0.9 - index * startSpread}px`,
							end: () => {
								const offset = shift - innerHeight * lift;
								return `bottom center${offset >= 0 ? '+=' : '-='}${Math.abs(offset)}`;
							},
							invalidateOnRefresh: true,
							scrub: 2,
							markers: markers && {
								indent: index * 90,
								startColor: ['#e8b84f', '#6fae6c', '#4fa3e8'][index % 3],
								endColor: ['#e8b84f', '#6fae6c', '#4fa3e8'][index % 3],
								fontSize: '12px'
							}
						}
					});
				});
			}, el);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	};
</script>

<section {id} class="cards-three {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy {...copy} still={isStatic} />

		<ul class="cards" {@attach !isStatic && desktop ? rise : undefined}>
			{#each cards.slice(0, 3) as card, index (index)}
				<li class="card {themes[index]}" {@attach !isStatic && !desktop ? animate() : undefined}>
					<div class="head">
						{#if card.icon}<Icon name={card.icon} class="card-icon" />{/if}
						<Tag text={String(index + 1)} type="outline" class="number" />
					</div>
					<h3 class="h5">{card.title}</h3>
					{#if card.description}<p><RichText text={card.description} /></p>{/if}
				</li>
			{/each}
		</ul>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';
	@use 'base/variables';

	.cards-three {
		padding-block: var(--section-space-start) var(--section-space-end);
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
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	.cards {
		display: grid;
		gap: 24px;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 16px;
		padding: 32px;
		border-radius: var(--radius);
		background: var(--color-surface);

		@include mixins.min-md {
			min-height: 22rem;
		}

		.head {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			margin-block-end: 32px;
		}

		:global(.card-icon) {
			--icon-size: 64px;

			color: var(--color-accent-text);
		}

		// A fixed minimum width so the 1, 2 and 3 tags are the same wide oval.
		.head :global(.number) {
			justify-content: center;
			min-width: 52px;
			margin-inline-start: auto;
			padding-inline: 16px;
		}

		&:nth-child(1) {
			background: variables.$taupe;
		}

		// Plum and maroon sit too close to the accent color, so their tags and icons take the text color.
		&:nth-child(2) {
			--color-accent: var(--color-text);
			--color-accent-text: var(--color-text);

			background: variables.$plum;
		}

		&:nth-child(3) {
			--color-accent: var(--color-text);
			--color-accent-text: var(--color-text);

			background: variables.$maroon;
		}

		h3 {
			margin: 0;
		}

		p {
			margin: 0;
			color: var(--color-text-muted);
		}
	}
</style>
