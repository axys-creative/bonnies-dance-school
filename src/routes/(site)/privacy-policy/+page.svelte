<script lang="ts">
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import site from '$lib/content/meta/site.json';
</script>

<HeroSimple
	id="hero"
	compact
	title="Privacy Policy"
	description="Last updated November 16, 2026."
/>

<section id="policy" class="policy">
	<h2 class="h4">What we collect</h2>
	<p>
		When a parent or guardian registers a dancer on this site, the form collects, for each dancer, a
		name, age and date of birth. It collects the parent or guardian's name, phone, address and
		email, the name and phone number of one or more emergency contacts, and a typed signature, a
		printed name and a date. We do not ask for medical information or payment details on this site.
	</p>
	<p>
		If you email or call us, we receive your email address or phone number and what you tell us.
	</p>

	<h2 class="h4">Children</h2>
	<p>
		Our dancers are mostly children. The registration form is for a parent or guardian to complete,
		and we collect a child's information only from them. We do not collect information directly from
		children under 13.
	</p>

	<h2 class="h4">Why we collect it</h2>
	<p>
		To enroll dancers, run classes, reach families about classes, and contact someone in an
		emergency. We do not use it for anything else.
	</p>

	<h2 class="h4">Who handles it</h2>
	<ul class="classic-list">
		<li>
			<strong>Netlify</strong> hosts this site, receives registration form submissions, and serves the
			site's images. Registrations are stored in our Netlify account, which only people we authorize can
			open.
		</li>
		<li>
			<strong>Mux</strong> delivers the video on the home page. When the video loads, Mux receives your
			IP address and device details.
		</li>
	</ul>
	<p>
		Links to Google Maps, Instagram and Facebook take you to those sites, which have their own
		privacy policies. This site does not take payments, so we never receive card details here.
	</p>

	<h2 class="h4">What we do not do</h2>
	<p>
		We do not sell or share personal information for advertising. This site has no analytics, no
		advertising trackers and no AI features, and it does not set tracking cookies.
	</p>

	<h2 class="h4">How long we keep it</h2>
	<p>
		We keep registration information while a dancer is enrolled and for as long as we need it for
		our records. You can ask us to delete it at any time.
	</p>

	<h2 class="h4">Your requests</h2>
	<p>
		To see, correct or delete your family's information, email
		<a href="mailto:{site.contactEmail}">{site.contactEmail}</a> or call {site.phone}.
	</p>
</section>

<style lang="scss">
	@use 'base/mixins';

	.policy {
		width: min(65ch, 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding) var(--section-space-start);

		@include mixins.body;
	}

	h2 {
		margin-block: 2.5rem 0.75rem;
	}

	p + p,
	ul {
		margin-top: 1rem;
	}
</style>
