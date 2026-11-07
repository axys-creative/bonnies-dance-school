<script lang="ts">
	import HeroAbout from '$lib/sections/hero-about.svelte';
	import RegistrationForm from '$lib/sections/registration-form.svelte';
	import hero from '$lib/content/page_join/hero-about.json';
	import registration from '$lib/content/page_join/registration-form.json';
</script>

<HeroAbout id="hero" {...hero} />
<RegistrationForm id="registration" {...registration} />
