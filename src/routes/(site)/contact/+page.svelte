<script lang="ts">
	import HeroAbout from '$lib/sections/hero-about.svelte';
	import CardsThree from '$lib/sections/cards-three.svelte';
	import Faq from '$lib/sections/faq.svelte';
	import hero from '$lib/content/page_contact/hero-about.json';
	import cards from '$lib/content/page_contact/cards-three.json';
	import faq from '$lib/content/page_contact/faq.json';
</script>

<HeroAbout id="hero" {...hero} />
<CardsThree id="contact-cards" {...cards} />
<Faq id="faq" {...faq} />
