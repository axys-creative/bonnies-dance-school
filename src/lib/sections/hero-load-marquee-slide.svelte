<script module lang="ts">
	export type HeroLoadMarqueeSlideProps = SectionCopyProps & {
		/**
		 * The heading, top to bottom. The first and last are text; the middle is a list of words that loop across the page
		 * as a marquee. The first of them is revealed in place, and the rest fade in when the marquee starts.
		 */
		words: [string, string[], string];
		/** The font size of the words, any CSS length. */
		size?: string;
		/** A mark between the looping words, so the middle line does not read as a sentence. An empty string shows none. */
		divider?: string;
		/** Pixels per second the middle word slides. */
		speed?: number;
		/** A video behind the section, a Mux playback ID or a video URL. */
		video?: string;
		/** The color of the text over the video. A scrim of the opposite color sits between them. Defaults to `'light'`. */
		textTheme?: 'light' | 'dark';
		/** How strong the scrim over the video is, 0 to 100. Defaults to `40`. */
		overlay?: number;
		/** At least the height of the screen. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the reveal and the slide, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { textReveal } from '$lib/attachments/text-reveal';
	import Marquee from '$lib/components/marquee.svelte';
	import VideoBg from '$lib/components/video-bg.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { loadGsap } from '$lib/utils/gsap';
	import { loading } from '$lib/utils/loading.svelte';

	let {
		words,
		size = 'clamp(48px, 9.5vw, 120px)',
		speed = 120,
		divider = '·',
		video,
		textTheme = 'light',
		overlay = 40,
		fullScreen = true,
		id,
		static: isStatic = false,
		class: className,
		description,
		cta,
		...copy
	}: HeroLoadMarqueeSlideProps = $props();

	const REVEAL = {
		type: 'chars',
		rotate: 5,
		duration: 0.8,
		stagger: 0.04,
		ease: 'power3.out',
		once: true
	} as const;
	const ROW_DELAY = 0.15;
	const HOLD = 0.1;
	const DRIFT = 120;
	const VIDEO_LEAD = 0.75;

	// Seconds until the last letter of the last row has landed.
	const revealTime = $derived(
		Math.max(
			...[words[0], words[1][0] ?? '', words[2]].map(
				(word, index) =>
					index * ROW_DELAY + ([...word].length - 1) * REVEAL.stagger + REVEAL.duration
			)
		)
	);

	let section = $state<HTMLElement>();
	let shown = $state(false);
	let sliding = $state(false);
	let opened = $state(false);
	let videoPaused = $state(false);
	// How far the last row can move right before it meets the content edge; the middle row sits halfway.
	let slack = $state(0);

	// The word is as wide as its text (not its block) and layout width ignores the reveal's rotation.
	function measure() {
		const row = section?.querySelector<HTMLElement>('.words > :last-child');
		const word = row?.querySelector<HTMLElement>('.word');
		if (row && word) slack = Math.max(0, row.clientWidth - word.offsetWidth);
	}

	onMount(() => {
		measure();
		const watch = new ResizeObserver(measure);
		watch.observe(section!);
		document.fonts.ready.then(measure);
		// Splitting the text into letters changes its width slightly.
		const split = new MutationObserver(measure);
		split.observe(section!, { childList: true, subtree: true });
		return () => {
			watch.disconnect();
			split.disconnect();
		};
	});

	// The video is taller than the section by the distance it drifts, so it drifts down as the page scrolls past.
	onMount(() => {
		const figure = section?.querySelector<HTMLElement>('.video-bg-figure');
		if (isStatic || !figure || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled) return;
			const context = gsap.context(() => {
				gsap.to(figure, {
					y: DRIFT,
					ease: 'none',
					scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true }
				});
			}, section);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	});

	const reveal = (index: number) =>
		isStatic || !loading.done
			? undefined
			: textReveal({ ...REVEAL, delay: index * ROW_DELAY, trigger: section });

	$effect(() => {
		if (isStatic || !loading.done) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			shown = true;
			opened = true;
			return;
		}

		let timer: ReturnType<typeof setTimeout>;
		let openTimer: ReturnType<typeof setTimeout>;
		const watch = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			watch.disconnect();
			openTimer = setTimeout(
				() => (opened = true),
				Math.max(0, revealTime + HOLD - VIDEO_LEAD) * 1000
			);
			timer = setTimeout(
				() => {
					sliding = true;
					shown = true;
				},
				(revealTime + HOLD) * 1000
			);
		});
		watch.observe(section!);

		return () => {
			watch.disconnect();
			clearTimeout(timer);
			clearTimeout(openTimer);
		};
	});
</script>

<section
	bind:this={section}
	{id}
	class="hero-load-marquee-slide {className ?? ''}"
	class:video-bg={video}
	class:theme-dark={video && textTheme === 'light'}
	class:theme-light={video && textTheme === 'dark'}
	class:full-screen={fullScreen}
	class:revealed={opened || isStatic}
	style="--size: {size}; --overlay: {overlay}; --indent-2: {slack / 2}px; --indent-3: {slack}px"
>
	{#if copy.eyebrowText || copy.eyebrowIcon}
		<div class="inner">
			<SectionCopy {...copy} showTitle={false} showDescription={false} showCta={false} />
		</div>
	{/if}
	<h1 class="visually-hidden">{words[0]} {words[1].join(', ')} {words[2]}</h1>

	<div class="words">
		<div class="inner">
			<span
				class="word"
				aria-hidden="true"
				data-reveal={isStatic ? undefined : ''}
				{@attach reveal(0)}>{words[0]}</span
			>
		</div>

		<div class="middle" class:sliding aria-hidden="true">
			<div class="inner">
				<span class="word" data-reveal={isStatic ? undefined : ''} {@attach reveal(1)}
					>{words[1][0]}</span
				>
			</div>
			{#if sliding}
				<Marquee
					class="slide"
					label={words[1].join(', ')}
					{speed}
					alternate={false}
					hold={videoPaused}
				>
					{#each words[1] as word, index (index)}
						<span class="word" style="--i: {index}">{word}</span>
						{#if divider}
							<span class="divider" style="--i: {index + 1}">{divider}</span>
						{/if}
					{/each}
				</Marquee>
			{/if}
		</div>

		<div class="inner">
			<span
				class="word"
				aria-hidden="true"
				data-reveal={isStatic ? undefined : ''}
				{@attach reveal(2)}>{words[2]}</span
			>
		</div>
	</div>

	{#if description || cta?.primary?.text}
		<div class="inner copy-row">
			<div class="copy" class:shown={shown || isStatic}>
				<SectionCopy
					{description}
					descriptionAttach={shown && !isStatic
						? textReveal({
								from: 'top',
								rotate: -5,
								duration: 0.9,
								stagger: 0.02,
								ease: 'power3.out',
								once: true,
								trigger: section
							})
						: undefined}
					{cta}
					showEyebrow={false}
					showTitle={false}
				/>
			</div>
		</div>
	{/if}

	{#if video}
		<VideoBg src={video} shadow={null} ontoggle={(paused) => (videoPaused = paused)} />
	{/if}
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-load-marquee-slide {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 48px;
		padding-block: var(--body-padding-double) calc(var(--body-padding-double) + 7rem);
		overflow: clip;
	}

	// The scrim takes the surface color, so it is dark under light text and light under dark text.
	.video-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--color-bg) min(calc(var(--overlay) * 1.5%), 95%), transparent),
			color-mix(in srgb, var(--color-bg) calc(var(--overlay) * 1%), transparent) 70%
		);
		pointer-events: none;
	}

	// The video stays put; a circle in the middle of its frame opens until it covers the section.
	.video-bg :global(.video-bg-figure) {
		top: -120px;

		@media (scripting: enabled) {
			clip-path: circle(0% at 50% 50%);
		}
	}

	.video-bg.revealed :global(.video-bg-figure) {
		clip-path: circle(72% at 50% 50%);

		@include mixins.mq-motion-allow {
			transition: clip-path 1.6s cubic-bezier(0.6, 0, 0.07, 1);
		}
	}

	// The pause button fades in as soon as the circle has finished opening (1.6s).
	.video-bg:not(.revealed) :global(.toggle) {
		@media (scripting: enabled) {
			opacity: 0;
			visibility: hidden;
		}
	}

	.video-bg.revealed :global(.toggle) {
		@include mixins.mq-motion-allow {
			transition:
				opacity 1s var(--ease) 1.6s,
				visibility 0s 1.6s,
				background var(--duration) var(--ease),
				color var(--duration) var(--ease),
				border-color var(--duration) var(--ease);
		}
	}

	.video-bg :global(.toggle) {
		@include mixins.mq-motion-allow {
			transition:
				opacity 1s var(--ease),
				background var(--duration) var(--ease),
				color var(--duration) var(--ease),
				border-color var(--duration) var(--ease);
		}
	}

	.full-screen {
		min-height: 100svh;
		justify-content: center;
	}

	.inner {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	// The line box is taller than the 1.05 the rows are spaced for, so the text mask does not clip ascenders and descenders; negative margins give the extra back.
	.words {
		--line-height: 1.3;
		--overhang: calc((var(--line-height) - 1.05) * 0.5em);

		display: flex;
		flex-direction: column;
		width: 100%;
		margin-block: calc(var(--overhang) * -1);
		font-size: var(--size);

		@include mixins.min-lg {
			translate: 0 40px;
		}

		> :global(* + *) {
			margin-top: calc(var(--overhang) * -2);
		}

		@include mixins.min-md {
			> :nth-child(2) {
				--indent: var(--indent-2, 96px);
			}

			> :nth-child(3) {
				--indent: var(--indent-3, 192px);
			}

			.inner {
				padding-inline-start: var(--indent, 0px);
			}
		}

		:global(.slide) {
			--gap: 0.4em;
			font-size: var(--size);
		}
	}

	// The revealed word and the marquee share one cell; the marquee's first copy starts at the content edge.
	.middle {
		display: grid;
		grid-template-columns: minmax(0, 1fr);

		> .inner,
		> :global(.slide) {
			grid-area: 1 / 1;
		}

		// The first word is already on screen as the revealed one; the others fade in as the marquee starts.
		:global(.slide .word),
		:global(.slide .divider) {
			@include mixins.mq-motion-allow {
				animation: fade-in 0.8s var(--ease) calc(var(--i) * 0.15s) backwards;
			}
		}

		:global(.slide .half:first-child .item:first-child .word:first-child) {
			animation: none;
		}

		:global(.slide) {
			padding-inline-start: calc(
				max(var(--body-padding), (100% - var(--content-width)) / 2) + var(--indent, 0px)
			);
		}

		&.sliding .inner {
			visibility: hidden;
		}
	}

	// The copy sits in the bottom left of the section, in line with the page content.
	.copy-row {
		position: absolute;
		bottom: var(--body-padding);
		right: 0;
		left: 0;
	}

	.copy {
		width: 100%;
		max-width: 440px;

		:global(.description) {
			color: var(--color-text);
			text-wrap: balance;
		}

		@media (scripting: enabled) {
			opacity: 0;
		}

		&.shown {
			opacity: 1;

			@include mixins.mq-motion-allow {
				transition: opacity 0.6s var(--ease);
			}
		}
	}

	.divider {
		font-size: var(--size);
		line-height: var(--line-height);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.word {
		display: block;
		width: fit-content;
		font-family: var(--font-heading);
		font-size: var(--size);
		font-weight: 300;
		line-height: var(--line-height);
		letter-spacing: 0;
		white-space: nowrap;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
</style>
