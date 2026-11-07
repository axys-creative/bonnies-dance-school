<script module lang="ts">
	export type EyebrowDescriptionProps = {
		eyebrowText?: string;
		/** Icon name from `static/icons`. */
		eyebrowIcon?: string;
		/** Plain text; `[words]{.class}` styles words. */
		description?: string;
		/** `split` puts the eyebrow at the left and the description at the right. `stacked` puts the description under the eyebrow. */
		layout?: 'split' | 'stacked';
		class?: string;
	};
</script>

<script lang="ts">
	import Eyebrow from './eyebrow.svelte';
	import RichText from './rich-text.svelte';

	let {
		eyebrowText,
		eyebrowIcon,
		description,
		layout = 'split',
		class: className
	}: EyebrowDescriptionProps = $props();
</script>

<div class="eyebrow-description {layout} {className ?? ''}">
	<div class="eyebrow-slot"><Eyebrow text={eyebrowText} icon={eyebrowIcon} /></div>
	{#if description}
		<p class="description"><RichText text={description} /></p>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	// The eyebrow sits at the left and the description at the right, aligned at their tops.
	.eyebrow-description {
		display: grid;
		gap: 24px;
		align-items: start;

		&.split {
			@include mixins.min-md {
				grid-template-columns: minmax(0, 1fr) minmax(0, 44rem);
				gap: var(--body-padding);
			}
		}

		&.stacked {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.description {
		margin: 0;
		font-size: 20px;
		line-height: 1.4;
		text-wrap: pretty;

		@include mixins.min-md {
			font-size: 24px;
		}
	}
</style>
