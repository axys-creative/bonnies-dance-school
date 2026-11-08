<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type Stat = {
		/** The number to roll up to. A thousand or more gets a comma. */
		digit: number;
		/** Text after the number, e.g. `+`. */
		suffix?: string;
		/** What the number measures. */
		label?: string;
	};

	export type StatsStickyProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title' | 'description'
	> & {
		/** The numbers, in a grid beside the copy. */
		stats: Stat[];
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Skips the title's scroll reveal, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Counter from '$lib/components/counter.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		stats,
		fullScreen = false,
		id,
		static: isStatic = false,
		class: className,
		...copy
	}: StatsStickyProps = $props();
</script>

<section {id} class="stats-sticky {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="copy">
			<SectionCopy {...copy} level={2} still={isStatic} />
		</div>

		<ul class="stats">
			{#each stats as stat, index (index)}
				<li class="stat">
					<Counter
						digit={stat.digit}
						comma={stat.digit >= 1000}
						suffix={stat.suffix}
						label={stat.label}
						ticker
					/>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.stats-sticky {
		padding-block-start: var(--section-space-start);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: grid;
		gap: 64px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;

		@include mixins.min-lg {
			grid-template-columns: 3fr 2fr;
			align-items: center;
			gap: var(--body-padding-double);
		}
	}

	.stats {
		display: grid;
		gap: 48px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.stat {
		:global(.counter) {
			align-items: flex-start;
		}

		:global(.value) {
			@include mixins.h2;
			justify-content: flex-start;
		}

		:global(.label) {
			@include mixins.body-large;
			color: var(--color-text-muted);
		}
	}
</style>
