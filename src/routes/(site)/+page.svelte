<script lang="ts">
	import { onMount } from 'svelte';
	import HeadlineJumbled from '$lib/sections/headline-jumbled.svelte';
	import Tunnel from '$lib/sections/tunnel.svelte';
	import HeroLoadMarqueeSlide from '$lib/sections/hero-load-marquee-slide.svelte';
	import hero from '$lib/content/page_home/hero-load-marquee-slide.json';
	import headline from '$lib/content/page_home/headline-jumbled.json';
	import tunnel from '$lib/content/page_home/tunnel.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

<HeroLoadMarqueeSlide
	id="hero"
	words={[hero.heading.before, hero.heading.words, hero.heading.after]}
	description={hero.description}
	{cta}
	video={hero.video}
	textTheme={hero.textTheme as 'light' | 'dark'}
	overlay={hero.overlay}
/>
<HeadlineJumbled id="headline" lines={headline.lines} fullScreen />
<Tunnel id="tunnel" img={tunnel.img} />
