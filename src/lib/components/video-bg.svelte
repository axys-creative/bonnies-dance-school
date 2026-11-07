<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';

	export type VideoBgProps = {
		/** The video file, a Mux playback ID or a Dropbox share link. Self-hosted or CDN files are best. */
		src: string;
		/** An image shown before the video plays. A Mux playback ID gets its thumbnail by default. */
		poster?: string;
		/** Starts playing on its own, muted and looping. Skipped when the visitor prefers reduced motion. */
		autoplay?: boolean;
		/** A dark gradient over the video for contrast with text. `null` removes it. */
		shadow?: 'top' | 'bottom' | null;
		/** Which corner holds the play / pause button. */
		placement?: 'br' | 'bl' | 'tr' | 'tl';
		/** An attachment for the button, such as `magnet()`. */
		toggleAttach?: Attachment<HTMLElement>;
		/** The video's accessible name. */
		title?: string;
		/** Called with `true` or `false` when the visitor presses the button to pause or play. */
		ontoggle?: (paused: boolean) => void;
	};
</script>

<script lang="ts">
	import { isHls, videoPoster, videoUrl } from '$lib/utils/video-url';
	import Button from './button.svelte';

	let {
		src,
		poster,
		autoplay = true,
		shadow = 'bottom',
		placement = 'br',
		toggleAttach,
		title = 'Background video',
		ontoggle
	}: VideoBgProps = $props();

	const url = $derived(videoUrl(src));
	const hls = $derived(isHls(url));
	const posterUrl = $derived(poster ?? videoPoster(src));
	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	let video = $state<HTMLVideoElement>();
	let paused = $state(true);

	// hls.js goes first: Chrome says "maybe" to native HLS but can't play it, so native playback is the fallback.
	$effect(() => {
		if (!video || !hls) return;
		const element = video;
		let cancelled = false;
		let destroy: (() => void) | undefined;
		import('hls.js').then(({ default: Hls }) => {
			if (cancelled) return;
			if (!Hls.isSupported()) {
				element.src = url;
				return;
			}
			const instance = new Hls();
			instance.loadSource(url);
			instance.attachMedia(element);
			if (autoplay && !reduced()) {
				instance.on(Hls.Events.MANIFEST_PARSED, () => element.play().catch(() => {}));
			}
			destroy = () => instance.destroy();
		});
		return () => {
			cancelled = true;
			destroy?.();
		};
	});

	const toggle = () => {
		if (!video) return;
		const pause = !video.paused;
		if (pause) video.pause();
		else video.play().catch(() => {});
		ontoggle?.(pause);
	};

	// Starts it here rather than trusting the `autoplay` attribute, which browsers skip when it is set after the
	// element is created.
	const start: Attachment<HTMLVideoElement> = (el) => {
		if (!autoplay || reduced()) return;
		el.muted = true;
		el.play().catch(() => {});
	};
</script>

<figure class="video-bg-figure {shadow ? `shadow-${shadow}` : ''}">
	<video
		bind:this={video}
		onplay={() => (paused = false)}
		onpause={() => (paused = true)}
		src={hls ? undefined : url}
		{title}
		poster={posterUrl}
		muted
		loop={autoplay}
		playsinline
		preload={autoplay ? 'auto' : 'metadata'}
		aria-hidden="true"
		{@attach start}
	></video>
</figure>

<Button
	class="toggle {placement}"
	type="solid"
	tone="tertiary"
	textDescription="{paused ? 'Play' : 'Pause'} background video"
	iconStart={paused ? 'play' : 'pause'}
	onclick={toggle}
	{@attach toggleAttach}
/>

<style lang="scss">
	@use 'base/mixins';

	// The wrapper holds the video behind its own content, so it must be its own stacking context.
	:global(.video-bg) {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	figure {
		position: absolute;
		inset: 0;
		z-index: -1;
		margin: 0;
		background: var(--color-surface);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(var(--shadow-direction), transparent 0%, black 100%);
		}

		&:not(.shadow-top, .shadow-bottom)::after {
			content: none;
		}
	}

	.shadow-bottom {
		--shadow-direction: 180deg;
	}

	.shadow-top {
		--shadow-direction: 0deg;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	:global(.toggle) {
		--gap: 24px;

		position: absolute;

		@include mixins.max-md {
			--gap: 16px;
		}
	}

	:global(.toggle.br) {
		bottom: var(--body-padding);

		@include mixins.right-spacing;
	}

	:global(.toggle.bl) {
		bottom: var(--body-padding);

		@include mixins.left-spacing;
	}

	:global(.toggle.tr) {
		top: var(--gap);
		right: var(--gap);
	}

	:global(.toggle.tl) {
		top: var(--gap);
		left: var(--gap);
	}
</style>
