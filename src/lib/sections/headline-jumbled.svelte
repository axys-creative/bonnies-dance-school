<script module lang="ts">
	export type HeadlineJumbledLine = {
		/** One line of the statement. Takes `[words]{.primary}` tokens, see Rich Text. */
		text: string;
		/** How far the line starts from the left, as a percentage of the width. Defaults to `0`. The last line ignores it from `md` and ends at the right edge of the content. */
		indent?: number;
	};

	export type HeadlineJumbledProps = {
		/** The statement, one entry per line. Together they read as one sentence; below `md` the lines run together. */
		lines: HeadlineJumbledLine[];
		/** The font size of the statement, any CSS length. Defaults to a size that fits the longest indented line. */
		size?: string;
		/** At least the height of the screen, with the statement centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the reveal, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { textFade } from '$lib/attachments/text-fade';
	import RichText from '$lib/components/rich-text.svelte';

	let {
		lines,
		size,
		fullScreen = false,
		id,
		static: isStatic = false,
		class: className
	}: HeadlineJumbledProps = $props();

	const SHIFT = '24px';

	let statement = $state<HTMLElement>();
	let seen = $state(false);

	const reveal = (index: number) =>
		isStatic
			? undefined
			: textFade({
					type: 'words',
					style: 'linear',
					duration: 1.3,
					stagger: 0.08,
					delay: index * 0.2,
					ease: 'power2.out',
					start: 'top 80%',
					trigger: statement
				});

	// Lines glide in from alternating sides each time the statement itself is 20% into the screen, as the fade starts.
	$effect(() => {
		if (isStatic || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			seen = true;
			return;
		}

		if (!statement) return;
		const watch = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting), {
			rootMargin: '0px 0px -20% 0px'
		});
		watch.observe(statement);
		return () => watch.disconnect();
	});
</script>

<section
	{id}
	class="headline-jumbled {className ?? ''}"
	class:full-screen={fullScreen}
	style={size ? `--size: ${size}` : undefined}
>
	<div class="inner">
		<!-- A statement, not a section title, so it is a paragraph that looks like a heading. -->
		<p class="text" bind:this={statement}>
			{#each lines as { text, indent = 0 }, index (index)}
				<span
					class="line"
					class:seen
					style="--indent: {indent}%; --from: {index % 2 === 0
						? SHIFT
						: `-${SHIFT}`}; --delay: {index * 0.2}s"
					{@attach reveal(index)}
				>
					<RichText {text} />
				</span>
			{/each}
		</p>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.headline-jumbled {
		overflow: clip;
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		container-type: inline-size;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--section-space-start) var(--section-space-end);
	}

	.text {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--size, clamp(32px, 6vw, 56px));
		font-weight: 300;
		line-height: 1.3;
		letter-spacing: 0;
	}

	// Below `md` the lines run together as one paragraph; the jumble needs the width.
	.line::after {
		content: ' ';
	}

	// The lines never wrap from `md`, so the size follows the width the longest indented line leaves.
	@include mixins.min-md {
		.text {
			font-size: var(--size, min(3.6cqw, 64px));
		}

		.line::after {
			content: none;
		}

		.line {
			display: block;
			padding-inline-start: var(--indent);
			white-space: nowrap;

			&:last-child {
				width: fit-content;
				margin-inline-start: auto;
				padding-inline-start: 0;
			}

			@media (scripting: enabled) {
				&:not(.seen) {
					translate: var(--from) 0;
				}
			}

			@include mixins.mq-motion-allow {
				transition: translate 1.2s var(--ease) var(--delay);
			}
		}
	}
</style>
