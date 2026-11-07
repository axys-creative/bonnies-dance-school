<script module lang="ts">
	export type HeroLoadSpreadProps = Pick<SectionCopyProps, 'description' | 'cta'> & {
		/** The lines of the heading, each stepped in from the one above. */
		words: string[];
		/** The font size of the words, any CSS length. */
		size?: string;
		/** At least the height of the screen. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the reveal, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { textReveal } from '$lib/attachments/text-reveal';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { loading } from '$lib/utils/loading.svelte';

	let {
		words,
		size = 'clamp(40px, 8vw, 140px)',
		fullScreen = true,
		id,
		static: isStatic = false,
		class: className,
		description,
		cta
	}: HeroLoadSpreadProps = $props();

	const REVEAL = {
		type: 'chars',
		duration: 0.5,
		stagger: 0.03,
		ease: 'power3.out',
		once: true
	} as const;
	const ROW_DELAY = 0.08;
	const HOLD = 0.15;

	// Seconds until the last letter of the last line has landed.
	const revealTime = $derived(
		Math.max(
			0,
			...words.map(
				(word, index) =>
					index * ROW_DELAY + ([...word].length - 1) * REVEAL.stagger + REVEAL.duration
			)
		)
	);

	let section = $state<HTMLElement>();
	let shown = $state(false);

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
			timer = setTimeout(() => (shown = true), (revealTime + HOLD) * 1000);
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
	class="hero-load-spread {className ?? ''}"
	class:full-screen={fullScreen}
	style="--size: {size}"
>
	<h1 class="visually-hidden">{words.join(' ')}</h1>

	<div class="stack">
		<div class="lines" aria-hidden="true">
			{#each words as word, index (index)}
				<div class="line" style="--index: {index}">
					<span class="word" {@attach reveal(index)}>{word}</span>
				</div>
			{/each}
		</div>

		{#if description || cta?.primary?.text}
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
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-load-spread {
		--line-height: 1.2;
		--step: 0.7em;
		--scale: 1;

		position: relative;
		display: grid;
		place-items: center;
		min-height: 28rem;
		padding: var(--body-padding);
		overflow: clip;

		@include mixins.max-md {
			--step: 0.25em;
			--scale: 1.6;
			place-items: stretch center;
		}
	}

	.full-screen {
		min-height: 100lvh;
	}

	.stack {
		display: grid;
		gap: 2rem;
		width: fit-content;
		max-width: 100%;

		// On a small screen the heading takes the room and the copy sits at the bottom.
		@include mixins.max-md {
			grid-template-rows: 1fr auto;
			gap: 3rem;
		}
	}

	.lines {
		display: grid;
		align-content: center;
		font-size: calc(var(--size) * var(--scale));
	}

	.line {
		margin-inline-start: calc(var(--index) * var(--step));
	}

	.word {
		display: block;
		font-family: var(--font-heading);
		font-size: calc(var(--size) * var(--scale));
		font-weight: 300;
		line-height: var(--line-height);
		letter-spacing: 0;
		text-wrap: balance;
	}

	.copy {
		width: 100%;
		max-width: 440px;

		@include mixins.min-md {
			position: absolute;
			bottom: var(--body-padding);
			left: max(var(--body-padding), (100% - var(--content-width)) / 2);
		}

		:global(.description) {
			@include mixins.description-large;

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
</style>
