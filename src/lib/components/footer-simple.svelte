<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { SocialLink } from './social-links.svelte';

	export type FooterSimpleProps = {
		socialLinks?: SocialLink[];
		/** The first column of links. */
		menu?: { title?: string; links: ButtonProps[] };
		contact?: { title?: string; email?: string; phone?: string; address?: string };
		/** The text repeated in the marquee. */
		marquee?: string;
		legalLinks?: ButtonProps[];
		credit?: { text: string; url?: string };
		copyright?: string;
		includeTop?: boolean;
		includeBottom?: boolean;
		float?: boolean;
		/** A translucent, blurred background. */
		blur?: boolean;
		/** The glass attachment's background: refraction in Chrome, blur elsewhere. Wins over `blur`. */
		glass?: boolean;
	};
</script>

<script lang="ts">
	import { glass as glassEffect } from '$lib/attachments/glass';
	import { headingReveal } from '$lib/attachments/text-reveal';
	import { onMount } from 'svelte';
	import { loadGsap, refreshScrollTriggers } from '$lib/utils/gsap';
	import site from '$lib/content/meta/site.json';
	import Button from './button.svelte';
	import Marquee from './marquee.svelte';
	import MenuLinks from './menu-links.svelte';
	import Tag from './tag.svelte';

	let {
		socialLinks = [],
		menu,
		contact,
		marquee,
		legalLinks = [],
		credit,
		copyright,
		includeTop = true,
		includeBottom = true,
		float = false,
		blur = false,
		glass = false
	}: FooterSimpleProps = $props();

	let wrapper = $state<HTMLElement>();
	let footer = $state<HTMLElement>();
	let wordmark = $state<HTMLElement>();
	let visit = $state(0);

	// Each time the wordmark leaves the screen it is made again, so it starts over from the left edge on the next visit.
	$effect(() => {
		if (!wordmark) return;
		const watch = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) visit++;
		});
		watch.observe(wordmark);
		return () => watch.disconnect();
	});

	// The footer starts lifted up behind the page and settles into place as the end of the page scrolls in.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		const pageHeight = new ResizeObserver(() => refreshScrollTriggers());
		pageHeight.observe(document.body);

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled || !wrapper || !footer) return;
			const context = gsap.context(() => {
				gsap.from(footer!, {
					y: -200,
					ease: 'none',
					scrollTrigger: {
						trigger: wrapper,
						start: 'top bottom',
						end: 'bottom bottom',
						scrub: true
					}
				});
			}, wrapper);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			pageHeight.disconnect();
			revert?.();
		};
	});

	const copyrightText = $derived(
		copyright || `© ${new Date().getFullYear()} ${site.siteName}. All rights reserved.`
	);
	const socials = $derived(
		socialLinks.map(({ title, url }) => ({
			text: title,
			url,
			newTab: true,
			type: 'underline' as const
		}))
	);
	const contactLinks = $derived(
		[
			contact?.email && { text: contact.email, url: `mailto:${contact.email}` },
			contact?.phone && { text: contact.phone, url: `tel:${contact.phone.replace(/[^\d+]/g, '')}` },
			contact?.address && {
				text: contact.address,
				url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
				newTab: true
			}
		].filter((link): link is { text: string; url: string; newTab?: boolean } => !!link)
	);
</script>

<div class="parallax" bind:this={wrapper}>
	<footer
		bind:this={footer}
		class="footer page-grid theme-dark"
		class:float
		class:blur={blur && !glass}
		{@attach glass ? glassEffect() : undefined}
	>
		{#if includeTop}
			<div class="top">
				<div class="start">
					{#if menu?.links.length}
						<div class="column">
							<Tag text={menu.title || 'Menu'} type="outline" />
							<MenuLinks links={menu.links} label={menu.title || 'Menu'} direction="column" />
						</div>
					{/if}
					{#if socials.length}
						<div class="column">
							<Tag text="Socials" type="outline" />
							<MenuLinks links={socials} label="Social media" direction="column" />
						</div>
					{/if}
				</div>

				{#if contactLinks.length}
					<div class="column">
						<Tag text={contact?.title || 'Contact'} type="outline" />
						<MenuLinks links={contactLinks} label="Contact" direction="column" />
					</div>
				{/if}
			</div>
		{/if}

		{#if marquee}
			<div class="wordmark full" bind:this={wordmark}>
				{#key visit}
					<Marquee label={marquee} speed={80}>
						<span
							{@attach headingReveal({
								trigger: wordmark,
								start: 'top 90%',
								delay: 0,
								once: false
							})}>{marquee}</span
						>
					</Marquee>
				{/key}
			</div>
		{/if}

		{#if includeBottom}
			<div class="bottom">
				<p class="copyright">{copyrightText}</p>
				<div class="bottom-end">
					{#if legalLinks.length}
						<nav aria-label="Legal">
							<ul>
								{#each legalLinks as link (link.url)}
									<li><Button {...link} type="underline" /></li>
								{/each}
							</ul>
						</nav>
					{/if}
					{#if credit?.text}
						{#if credit.url}
							<Button text={credit.text} url={credit.url} newTab type="underline" />
						{:else}
							<span class="credit">{credit.text}</span>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
	</footer>
</div>

<style lang="scss">
	@use 'base/mixins';
	@use 'base/variables';

	.parallax {
		margin-block-start: auto;
	}

	// A tan surface in the dark theme, with light copy.
	.footer {
		--color-text-muted: var(--color-text);
		--color-accent-text: var(--color-text);

		grid-template-rows: 1fr auto auto auto;
		min-height: 100lvh;
		background: variables.$tan;
		color: var(--color-text);
		padding-block: 48px 24px;
	}

	.float {
		grid-template-columns: [full-start content-start] 1fr [content-end full-end];
		width: calc(100% - var(--float-offset) * 2);
		max-width: var(--content-width);
		min-height: calc(100lvh - var(--float-offset) * 2);
		margin: auto auto var(--float-offset);
		padding-inline: var(--body-padding);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		overflow: clip;
	}

	.blur {
		@include mixins.glass;
	}

	.top {
		grid-row: 2;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 48px;

		@include mixins.min-md {
			flex-direction: row;
		}
	}

	.start {
		display: flex;
		flex-wrap: wrap;
		gap: 48px 64px;
	}

	.column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;

		// The same inline padding as the number tags on the cards.
		:global(.tag) {
			padding-inline: 16px;
		}
	}

	.wordmark {
		grid-row: 3;
		padding-block: 16px 48px;

		@include mixins.min-lg {
			padding-block-start: 120px;
		}

		.float & {
			margin-inline: calc(var(--body-padding) * -1);
		}

		:global(.marquee.marquee) {
			padding-inline-start: max(var(--body-padding), (100% - var(--content-width)) / 2);
			@include mixins.h1;
			font-size: clamp(56px, 12vw, 180px);
			line-height: 1.5;
		}
	}

	.bottom {
		grid-row: 4;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;

		@include mixins.min-md {
			flex-direction: row;
			align-items: center;
		}
	}

	.copyright,
	.credit {
		color: var(--color-text-muted);
		font-size: 14px;
		line-height: 1.5;
	}

	.bottom-end {
		--btn-font-size: 14px;

		li {
			display: flex;
		}
	}

	.bottom-end,
	.bottom-end ul {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px 40px;
		padding: 0;
		list-style: none;
	}
</style>
