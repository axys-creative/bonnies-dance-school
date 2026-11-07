<script module lang="ts">
	export type ImageHalfProps = {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		img?: { src?: string; alt?: string };
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';

	let { id, img, fullScreen = false, class: className }: ImageHalfProps = $props();
</script>

<section {id} class="image-half {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		{#if img?.src}
			<img
				{...imageProps(img.src, { sizes: '(min-width: 768px) 50vw, 100vw' })}
				alt={img.alt ?? ''}
			/>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.image-half {
		padding-block: var(--body-padding-double);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
	}

	img {
		display: block;
		width: 100%;
		margin-inline-start: auto;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
		object-fit: cover;

		@include mixins.min-md {
			width: 50%;
		}
	}
</style>
