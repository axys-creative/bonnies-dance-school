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
	import { textReveal } from '$lib/attachments/text-reveal';
	import Marquee from '$lib/components/marquee.svelte';
	import VideoBg from '$lib/components/video-bg.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { loading } from '$lib/utils/loading.svelte';

	let {
		words,
		size = 'clamp(56px, 12vw, 150px)',
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
		duration: 0.8,
		stagger: 0.05,
		ease: 'power3.out',
		once: true
	} as const;
	const ROW_DELAY = 0.15;
	const HOLD = 0.1;

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

	const reveal = (index: number) =>
		isStatic || !loading.done
			? undefined
			: textReveal({ ...REVEAL, delay: index * ROW_DELAY, trigger: section });

	$effect(() => {
		if (isStatic || !loading.done) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			shown = true;
			return;
		}

		let timer: ReturnType<typeof setTimeout>;
		const watch = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			watch.disconnect();
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
	style="--size: {size}; --overlay: {overlay}"
>
	{#if copy.eyebrowText || copy.eyebrowIcon}
		<div class="inner">
			<SectionCopy {...copy} showTitle={false} showDescription={false} showCta={false} />
		</div>
	{/if}
	<h1 class="visually-hidden">{words[0]} {words[1].join(', ')} {words[2]}</h1>

	<div class="words">
		<div class="inner">
			<span class="word" aria-hidden="true" {@attach reveal(0)}>{words[0]}</span>
		</div>

		<div class="middle" class:sliding aria-hidden="true">
			<div class="inner">
				<span class="word" {@attach reveal(1)}>{words[1][0]}</span>
			</div>
			{#if sliding}
				<Marquee class="slide" label={words[1].join(', ')} {speed} alternate={false}>
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
			<span class="word" aria-hidden="true" {@attach reveal(2)}>{words[2]}</span>
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
								duration: 0.6,
								stagger: 0.03,
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
		<VideoBg src={video} shadow={null} />
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

	.full-screen {
		min-height: 100lvh;
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

		> :global(* + *) {
			margin-top: calc(var(--overhang) * -2);
		}

		@include mixins.min-md {
			> :nth-child(2) {
				--indent: 96px;
			}

			> :nth-child(3) {
				--indent: 192px;
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
