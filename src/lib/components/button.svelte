<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

	export type ButtonProps = {
		text?: string;
		textDescription?: string;
		url?: string;
		newTab?: boolean;
		type?: 'solid' | 'outline' | 'underline' | 'text';
		htmlType?: 'button' | 'submit' | 'reset';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		current?: boolean;
		expanded?: boolean;
		controls?: string;
		iconStart?: string;
		iconEnd?: string;
		/** Draws a ring around the end icon on hover. */
		iconCircle?: boolean;
		/** An attachment for the end icon alone, e.g. `magnet()` to make only the icon follow the mouse. */
		iconEndAttach?: Attachment<HTMLElement>;
		class?: string;
		onclick?: MouseEventHandler<HTMLButtonElement>;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'onclick'>;
</script>

<script lang="ts">
	import { isCurrentPage, onCurrentPageClick } from '$lib/utils/current-page';
	import { roll } from '$lib/attachments/roll';
	import Icon from './icon.svelte';

	let {
		text,
		textDescription,
		url,
		newTab = false,
		type = 'solid',
		htmlType = 'button',
		size = 'md',
		disabled = false,
		current = false,
		expanded,
		controls,
		iconStart,
		iconEnd,
		iconCircle = false,
		iconEndAttach,
		class: className,
		onclick,
		...rest
	}: ButtonProps = $props();

	const label = $derived(
		textDescription && newTab ? `${textDescription} (opens in a new tab)` : textDescription
	);
	const onCurrentPage = $derived(!newTab && isCurrentPage(url));
	const isLink = $derived(type === 'text' || type === 'underline');
	const classes = $derived(
		`button ${type} ${size} ${text ? '' : 'icon-only'} ${iconEnd && type === 'solid' ? 'has-end' : ''} ${className ?? ''}`
	);
</script>

{#snippet content()}
	{#if iconStart}<Icon name={iconStart} />{/if}
	{#if text}<span class="label">{text}</span>{/if}
	{#if newTab && !textDescription}
		<span class="visually-hidden">(opens in a new tab)</span>
	{/if}
	{#if iconEnd}
		<span class="end" {@attach iconEndAttach}>
			<Icon name={iconEnd} />
			{#if iconCircle}
				<svg class="circle" viewBox="0 0 48 48" fill="none" aria-hidden="true">
					<path
						pathLength="1"
						d="M24.014 1C36.7101 1.00759 47 11.3021 47 24C47 36.7025 36.7025 47 24 47C11.2975 47 1 36.7025 1 24C1 11.3021 11.2899 1.00759 23.986 1"
					/>
				</svg>
			{/if}
		</span>
	{/if}
{/snippet}

{#if url}
	<a
		{...rest}
		{@attach isLink ? roll({ delay: 0.1 }) : undefined}
		class={classes}
		href={url}
		aria-label={label}
		aria-current={current || onCurrentPage ? 'page' : undefined}
		onclick={onCurrentPage ? onCurrentPageClick : undefined}
		aria-expanded={expanded}
		aria-controls={controls}
		target={newTab ? '_blank' : undefined}
		rel={newTab ? 'noopener noreferrer' : undefined}
	>
		{@render content()}
	</a>
{:else}
	<button
		{...rest}
		{@attach isLink ? roll({ delay: 0.1 }) : undefined}
		class={classes}
		type={htmlType}
		aria-label={label}
		aria-current={current ? 'true' : undefined}
		aria-expanded={expanded}
		aria-controls={controls}
		{disabled}
		{onclick}
	>
		{@render content()}
	</button>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.button {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: var(--btn-gap);
		padding: 0;
		border: 0;
		border-radius: var(--radius-btn);
		background: none;
		font-family: var(--font-body);
		font-size: var(--btn-font-size);
		font-weight: var(--btn-font-weight);
		line-height: 1.2;
		text-decoration: none;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				color var(--duration) var(--ease),
				border-color var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}
	}

	.solid,
	.outline {
		padding: var(--btn-padding);
		border: 1px solid var(--color-accent);
	}

	.solid {
		background: var(--color-accent);
		color: var(--color-on-accent);

		@include mixins.desktop-hover {
			background: transparent;
			color: var(--color-accent-text);
		}
	}

	// With an end icon the fill is a layer behind the content. On hover it narrows to a square at the right, around the
	// icon, which then move together as one piece. Its minimum width, not its width, is what changes: the width is the
	// height (aspect-ratio) once the minimum is gone.
	.solid.has-end {
		--py: 8px;
		// How far the square and icon sit right of rest while hovered, so the square clears the last letter.
		--shift: 12px;
		--ease-cta: cubic-bezier(0.33, -0.22, 0.24, 1.44);

		position: relative;
		isolation: isolate;
		padding-inline-end: calc(var(--py) + 0.1em);
		border-color: transparent;
		background: none;

		&.sm {
			--py: 6px;
		}

		&.lg {
			--py: 12px;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			z-index: -1;
			height: 100%;
			min-width: 100%;
			aspect-ratio: 1;
			border-radius: var(--radius-btn);
			background: var(--color-accent);

			@include mixins.mq-motion-allow {
				transition:
					min-width 0.75s var(--ease-cta),
					translate 0.4s var(--ease-cta);
			}
		}

		.end {
			color: var(--color-on-accent);

			@include mixins.mq-motion-allow {
				transition: translate 0.4s var(--ease-cta);
			}
		}

		@include mixins.desktop-hover {
			background: none;

			&::before {
				min-width: 0;
			}

			&::before,
			.end {
				translate: var(--shift) 0;
			}

			// The square and the icon share one animation, so they move as a single piece: the width comes in and pushes
			// them right, with a slight tilt, and they settle back.
			@include mixins.mq-motion-allow {
				&::before,
				.end {
					animation: push 1s var(--ease-cta) 0.2s;
				}
			}
		}
	}

	@keyframes push {
		35% {
			translate: calc(var(--shift) + 5px) 0;
			rotate: 8deg;
		}

		100% {
			translate: var(--shift) 0;
			rotate: 0deg;
		}
	}

	.outline {
		color: var(--color-text);

		@include mixins.desktop-hover {
			color: var(--color-accent-text);

			@include mixins.mq-motion-allow {
				scale: 0.96;
			}
		}
	}

	.label {
		position: relative;
	}

	.end {
		position: relative;
		display: inline-flex;
	}

	.circle {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 1.5em;
		height: 1.5em;
		translate: -50% -50%;
		pointer-events: none;

		path {
			stroke: currentColor;
			stroke-width: 2px;
			stroke-dasharray: 1;
			stroke-dashoffset: 1;

			@include mixins.mq-motion-allow {
				transition: stroke-dashoffset 1.2s var(--ease);
			}
		}
	}

	.button {
		@include mixins.desktop-hover {
			.circle path {
				stroke-dashoffset: 0;
			}
		}
	}

	.button > :global(.icon),
	.end > :global(.icon) {
		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}
	}

	.button[aria-expanded='true'] > :global(.icon:last-child),
	.button[aria-expanded='true'] > .end:last-child > :global(.icon) {
		scale: 1 -1;
	}

	.underline,
	.text {
		--fill-y: 9px;
		--fill-x: 17px;

		position: relative;
		isolation: isolate;

		&.sm {
			--fill-y: 7px;
			--fill-x: 13px;
		}

		&.lg {
			--fill-y: 13px;
			--fill-x: 25px;
		}

		&::before {
			content: '';
			position: absolute;
			inset: calc(-1 * var(--fill-y)) calc(-1 * var(--fill-x));
			z-index: -1;
			border-radius: var(--radius-btn);
			background: var(--color-secondary);
			transform: scaleX(0);
			transform-origin: left;

			@include mixins.mq-motion-allow {
				transition: transform 0.5s var(--ease);
			}
		}

		@include mixins.desktop-hover {
			color: var(--color-on-accent);

			&::before {
				transform: scaleX(1);
			}
		}
	}

	.underline {
		color: var(--color-text);
	}

	.text {
		color: var(--color-accent-text);
	}

	.sm {
		--btn-font-size: 13px;
	}

	.lg {
		--btn-font-size: 18px;
	}

	.solid.sm,
	.outline.sm {
		padding: var(--btn-padding-sm);
	}

	.solid.lg,
	.outline.lg {
		padding: var(--btn-padding-lg);
	}

	.button.icon-only {
		padding: var(--btn-padding-icon);
	}
</style>
