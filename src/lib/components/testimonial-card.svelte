<script module lang="ts">
	import type { CarouselTestimonial } from '$lib/sections/carousel-testimonials.svelte';

	export type TestimonialCardProps = CarouselTestimonial & { class?: string };
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import RichText from './rich-text.svelte';
	import Tag from './tag.svelte';

	let { quote, name, role, image, class: className }: TestimonialCardProps = $props();
</script>

<figure class="testimonial-card {className ?? ''}">
	<blockquote><p><RichText text={quote} /></p></blockquote>
	<figcaption>
		{#if image?.src}
			<img
				{...imageProps(image.src, { sizes: '56px' })}
				alt={image.alt ?? ''}
				loading="lazy"
				draggable="false"
			/>
		{/if}
		<span class="who">
			<span class="name">{name}</span>
			{#if role}<Tag text={role} type="outline" />{/if}
		</span>
	</figcaption>
</figure>

<style lang="scss">
	@use 'base/mixins';

	.testimonial-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
		margin: 0;
		padding: 32px;
		border-radius: var(--radius);
		background: var(--color-surface);
		white-space: normal;

		blockquote,
		p {
			margin: 0;
		}

		p {
			@include mixins.body-large;
		}
	}

	figcaption {
		display: flex;
		align-items: center;
		gap: 16px;

		img {
			flex-shrink: 0;
			width: 56px;
			height: 56px;
			border-radius: 50%;
			object-fit: cover;
		}
	}

	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
	}

	.name {
		font-weight: 700;
	}
</style>
