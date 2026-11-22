<script module lang="ts">
	type Drawing = {
		viewBox: string;
		strokeWidth: string;
		shapes: { tag: string; attrs: Record<string, string> }[];
	};

	const TAGS = ['circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'];
	const ATTRS = [
		'cx',
		'cy',
		'd',
		'height',
		'points',
		'r',
		'rx',
		'ry',
		'stroke-dasharray',
		'transform',
		'width',
		'x',
		'x1',
		'x2',
		'y',
		'y1',
		'y2'
	];

	const cache: Record<string, Promise<Drawing | null>> = {};

	function load(src: string) {
		let drawing = cache[src];
		if (!drawing) {
			drawing = fetch(src)
				.then((response) => (response.ok ? response.text() : Promise.reject()))
				.then((text) => {
					const root = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
					if (root.localName !== 'svg') return null;
					const shapes = Array.from(root.children)
						.filter((node) => TAGS.includes(node.localName))
						.map((node) => ({
							tag: node.localName,
							attrs: Object.fromEntries(
								ATTRS.filter((name) => node.hasAttribute(name)).map((name) => [
									name,
									node.getAttribute(name) as string
								])
							)
						}));
					return {
						viewBox: root.getAttribute('viewBox') ?? '0 0 64 64',
						strokeWidth: root.getAttribute('stroke-width') ?? '1',
						shapes
					};
				})
				.catch(() => null);
			cache[src] = drawing;
		}
		return drawing;
	}
</script>

<script lang="ts">
	import { drawLoop, type DrawLoopOptions } from '$lib/attachments/draw-loop';
	import Icon from './icon.svelte';

	type Props = {
		/** A stroke-only SVG: a path starting with `/`, or the name of a file in `/icons`. */
		name: string;
		/** Shows the plain icon with no animation, for the CMS preview. */
		still?: boolean;
		options?: DrawLoopOptions;
		class?: string;
	};

	let { name, still = false, options, class: className }: Props = $props();

	const src = $derived(name.startsWith('/') ? name : `/icons/${name}.svg`);
	let drawing = $state<Drawing | null>(null);

	$effect(() => {
		drawing = null;
		if (still || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let stale = false;
		load(src).then((result) => {
			if (!stale) drawing = result;
		});
		return () => (stale = true);
	});
</script>

{#if drawing?.shapes.length}
	<svg
		class="icon-draw {className ?? ''}"
		viewBox={drawing.viewBox}
		fill="none"
		stroke="currentColor"
		stroke-width={drawing.strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		{@attach drawLoop(options)}
	>
		{#each drawing.shapes as shape, index (index)}
			<svelte:element this={shape.tag} {...shape.attrs} />
		{/each}
	</svg>
{:else}
	<Icon {name} class={className} />
{/if}

<style lang="scss">
	.icon-draw {
		--icon-size: 1em;

		display: inline-block;
		flex-shrink: 0;
		width: var(--icon-size);
		height: var(--icon-size);
		vertical-align: middle;
		overflow: visible;

		> :global(*) {
			opacity: 0;
		}
	}
</style>
