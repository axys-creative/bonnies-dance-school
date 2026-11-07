<script lang="ts">
	import CopySplit from '$lib/sections/copy-split.svelte';
	import HeroAbout from '$lib/sections/hero-about.svelte';
	import ImageHalf from '$lib/sections/image-half.svelte';
	import hero from '$lib/content/page_about/hero-about.json';
	import image from '$lib/content/page_about/image-half.json';
	import approach from '$lib/content/page_about/copy-split.json';
</script>

<HeroAbout id="hero" {...hero} />
<ImageHalf id="image" img={image.img} />
<CopySplit id="approach" {...approach} />
