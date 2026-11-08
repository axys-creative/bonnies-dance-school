<script lang="ts">
	import CopySplit from '$lib/sections/copy-split.svelte';
	import HeroAbout from '$lib/sections/hero-about.svelte';
	import TestimonialsGrid from '$lib/sections/testimonials-grid.svelte';
	import StatsSticky from '$lib/sections/stats-sticky.svelte';
	import ImageHalf from '$lib/sections/image-half.svelte';
	import hero from '$lib/content/page_about/hero-about.json';
	import image from '$lib/content/page_about/image-half.json';
	import reviews from '$lib/content/global/reviews.json';
	import grid from '$lib/content/page_about/testimonials-grid.json';
	import approach from '$lib/content/page_about/copy-split.json';
	import stats from '$lib/content/page_about/stats-sticky.json';
</script>

<HeroAbout id="hero" {...hero} />
<ImageHalf id="image" img={image.img} />
<CopySplit id="approach" {...approach} />
<StatsSticky id="stats" {...stats} />
<TestimonialsGrid id="reviews" {...grid} testimonials={reviews.reviews} />
