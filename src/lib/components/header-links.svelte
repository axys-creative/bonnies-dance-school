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

	const close = () => (open = false);

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !open) return;
		close();
		bar?.querySelector<HTMLElement>('.menu')?.focus();
	};

	afterNavigate(close);
</script>

<svelte:window onkeydown={onKeydown} />

<header class="header {position}" class:blend data-nav-open={open || undefined} data-header-parts>
	{#if showSkipLink}
		<a class="skip-link" href="#main">Skip to main content</a>
	{/if}

	{#if logo}
		<div class="logo" {@attach themeFollow()}><Logo {...logo} url="/" /></div>
	{/if}

	<div class="bar" bind:this={bar} {@attach themeFollow()}>
		<div class="wide">
			<MenuLinks links={pages} label="Main" type="text" />
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
		--top: 20px;

		top: 0;
		left: 0;
		z-index: var(--z-header);
		width: 100%;
		height: 0;
		pointer-events: none;

		@include mixins.min-lg {
			--top: 32px;
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

	// Centered on the line of the links and the button, which are shorter than the logo.
	.logo {
		--logo-height: 40px;

		position: absolute;
		top: calc(var(--top) + 17px);

		@include mixins.left-spacing;
		translate: 0 -50%;
		pointer-events: auto;

		@include mixins.min-lg {
			--logo-height: 56px;
		}
	}

	.bar {
		position: absolute;
		top: var(--top);
		display: flex;
		align-items: center;
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
			gap: 2ch;
		}
	}

	.bar :global(.menu) {
		@include mixins.min-lg {
			display: none;
		}
	}

	.skip-link {
		position: absolute;
		top: var(--top);
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
