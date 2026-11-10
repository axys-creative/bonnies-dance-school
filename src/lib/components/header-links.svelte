<script module lang="ts">
	import type { HeaderNavProps } from './header-types';

	export type HeaderLinksProps = HeaderNavProps & {
		/** `fixed` stays on screen while the page scrolls. `absolute` is part of the top of the page and scrolls away with it. */
		position?: 'fixed' | 'absolute';
		/** Draws over the page in inverted colors (`mix-blend-mode: difference`), so it stays readable over any picture or color. */
		blend?: boolean;
	};
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { glass } from '$lib/attachments/glass';
	import { roll } from '$lib/attachments/roll';
	import { themeFollow } from '$lib/attachments/theme-follow';
	import Button from './button.svelte';
	import Logo from './logo.svelte';
	import MenuLinks from './menu-links.svelte';
	import SiteNav from './site-nav.svelte';

	let {
		logo,
		links = [],
		ctas = [],
		socialLinks = [],
		showSkipLink = true,
		position = 'fixed',
		blend = false
	}: HeaderLinksProps = $props();

	const id = $props.id();
	const navId = `${id}-navigation`;
	// A link that opens a dropdown has no page of its own, so it is left out.
	const pages = $derived(links.filter((link) => link.url && !link.links?.length));

	let open = $state(false);
	let bar = $state<HTMLElement>();
	let scrolled = $state(false);

	const close = () => (open = false);

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !open) return;
		close();
		bar?.querySelector<HTMLElement>('.menu')?.focus();
	};

	afterNavigate(close);

	const GLASS_AFTER = 64;

	$effect(() => {
		if (position !== 'fixed') return;
		const update = () => (scrolled = scrollY > GLASS_AFTER);
		update();
		addEventListener('scroll', update, { passive: true });
		return () => removeEventListener('scroll', update);
	});
</script>

<svelte:window onkeydown={onKeydown} />

<header class="header {position}" class:blend data-nav-open={open || undefined} data-header-parts>
	{#if showSkipLink}
		<a class="skip-link" href="#main">Skip to main content</a>
	{/if}

	{#if position === 'fixed'}
		<div class="backdrop" class:scrolled {@attach glass({ blur: 16 })}></div>
	{/if}

	{#if logo}
		<div class="logo" {@attach themeFollow()}><Logo {...logo} url="/" /></div>
	{/if}

	<div class="bar" bind:this={bar} {@attach themeFollow()}>
		<div class="wide">
			<MenuLinks links={pages} label="Main" type="underline" />
			{#each ctas.slice(0, 1) as cta (`${cta.url}|${cta.text}`)}
				<Button {...cta} iconEnd={cta.iconEnd || 'arrow-tr'} type="solid" {@attach roll()} />
			{/each}
		</div>

		<Button
			class="menu"
			text={open ? 'Close' : 'Menu'}
			textDescription={open ? 'Close navigation menu' : 'Open navigation menu'}
			expanded={open}
			controls={navId}
			onclick={() => (open = !open)}
			{@attach roll()}
		/>
	</div>
</header>

<SiteNav id={navId} {open} {links} {ctas} {socialLinks} variant="left" onlink={close} />

<style lang="scss">
	@use 'base/mixins';

	.header {
		--top: 28px;

		top: 0;
		left: 0;
		z-index: var(--z-header);
		width: 100%;
		height: 0;
		pointer-events: none;

		@include mixins.min-lg {
			--top: 36px;
		}
	}

	.fixed {
		position: fixed;
	}

	.absolute {
		position: absolute;
	}

	.blend {
		color: #fff;
		mix-blend-mode: difference;
	}

	// A floating bar behind the logo and links that appears once the page has scrolled, centered on their line.
	.backdrop {
		position: absolute;
		top: var(--float-offset);
		left: 50%;
		width: min(100% - var(--float-offset) * 2, var(--content-width) + 48px);
		height: calc((var(--top) + 17px - var(--float-offset)) * 2);
		border-radius: var(--radius);
		translate: -50% 0;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				visibility 0.3s;
		}

		&.scrolled {
			opacity: 1;
			visibility: visible;
		}
	}

	.header[data-nav-open] .backdrop {
		opacity: 0;
		visibility: hidden;
	}

	// Centered on the line of the links and the button, which are shorter than the logo.
	.logo {
		--logo-height: 40px;

		position: absolute;
		top: calc(var(--top) + 17px);
		display: flex;

		@include mixins.left-spacing;
		translate: 0 -50%;
		pointer-events: auto;

		@include mixins.min-lg {
			--logo-height: 48px;
		}
	}

	.bar {
		position: absolute;
		top: calc(var(--top) + 17px);
		display: flex;
		align-items: center;
		translate: 0 -50%;
		pointer-events: auto;

		@include mixins.right-spacing;
	}

	// From `lg` up the links and the button are in the bar; below that, one Menu button opens the navigation.
	.wide {
		display: none;
		align-items: center;
		gap: 2ch;

		@include mixins.min-lg {
			display: flex;
		}

		:global(.menu-links) {
			gap: 4ch;
		}

		:global(.menu-links li) {
			display: flex;
		}
	}

	.bar :global(.menu) {
		@include mixins.min-lg {
			display: none;
		}
	}

	.skip-link {
		position: absolute;
		top: calc((var(--top) + 17px) * 2 + 8px);
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		pointer-events: auto;

		@include mixins.left-spacing;

		&:focus {
			width: auto;
			height: auto;
			padding: 8px 16px;
			clip-path: none;
			border: 1px solid var(--color-border);
			border-radius: var(--radius-btn);
			background: var(--color-bg);
		}
	}
</style>
