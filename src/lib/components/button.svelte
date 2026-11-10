<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

	export type ButtonProps = {
		text?: string;
		textDescription?: string;
		url?: string;
		newTab?: boolean;
		type?: 'solid' | 'outline' | 'underline' | 'text';
		/** `secondary` and `tertiary` swap the accent color for the secondary (plum) or tertiary (tan) one, to set a button apart from the primary call to action. */
		tone?: 'primary' | 'secondary' | 'tertiary';
		htmlType?: 'button' | 'submit' | 'reset';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		current?: boolean;
		expanded?: boolean;
		controls?: string;
		iconStart?: string;
		iconEnd?: string;
		/** A solid button's fill rolls up out of the top on hover and back down on leaving. */
		drop?: boolean;
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
		tone = 'primary',
		htmlType = 'button',
		size = 'md',
		disabled = false,
		current = false,
		expanded,
		controls,
		iconStart,
		iconEnd,
		drop = false,
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
		`button ${type} ${tone === 'primary' ? '' : tone} ${size} ${text ? '' : 'icon-only'} ${iconEnd && type === 'solid' ? 'has-end' : ''} ${drop && type === 'solid' ? 'drop' : ''} ${className ?? ''}`
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

	.secondary {
		--color-accent: var(--color-secondary);
		--color-accent-text: var(--color-secondary);
	}

	.tertiary {
		--color-accent: var(--color-tertiary);
		--color-accent-text: var(--color-tertiary);
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

	// The fill is a background image that slides up and out of the button on hover (with a rolling label), and back down on leaving. It adds no
	// layer, so the button keeps whatever position its container gives it.
	.solid.drop {
		// Twice the button's height: accent above, empty below. Resting shows the accent half; sliding the image up shows the empty half.
		--fill: linear-gradient(var(--color-accent) 50%, transparent 50%);

		background: var(--fill) 0 0 / 100% 200% no-repeat;

		@include mixins.mq-motion-allow {
			transition:
				background-position 0.5s var(--ease),
				color var(--duration) var(--ease),
				border-color var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			background: var(--fill) 0 100% / 100% 200% no-repeat;
		}
	}

	// With an end icon the fill is a layer behind the content. On hover it narrows to a square at the right, around the
	// icon, which then move together as one piece. Its minimum width, not its width, is what changes: the width is the
	// height (aspect-ratio) once the minimum is gone.
	.solid.has-end {
		--py: 4px;
		// How far the square and icon sit right of rest while hovered, so the square clears the last letter.
		--shift: 12px;
		--ease-cta: cubic-bezier(0.33, -0.22, 0.24, 1.44);

		position: relative;
		isolation: isolate;
		padding-inline-end: calc(var(--py) + 0.1em);
		border-color: transparent;
		background: none;

		&.sm {
			--py: 2px;
		}

		&.lg {
			--py: 8px;
		}

		&::before {
			content: '';
			position: absolute;
			top: -1px;
			right: -1px;
			z-index: -1;
			height: calc(100% + 2px);
			min-width: calc(100% + 2px);
			aspect-ratio: 1;
			border-radius: var(--radius-btn);
			background: var(--color-accent);

			@include mixins.mq-motion-allow {
				transition:
					min-width 0.75s var(--ease),
					translate 0.4s var(--ease);
			}
		}

		.end {
			color: var(--color-on-accent);

			@include mixins.mq-motion-allow {
				transition: translate 0.4s var(--ease);
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
			// The springy ease is only for going in; on leaving they settle back with the plain ease above.
			@include mixins.mq-motion-allow {
				&::before {
					transition:
						min-width 0.75s var(--ease-cta),
						translate 0.4s var(--ease-cta);
				}

				.end {
					transition: translate 0.4s var(--ease-cta);
				}

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

		:global(.icon) {
			--icon-size: 0.9em;
		}
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
		--fill-y: 5px;
		--fill-x: 13px;
		--dot: 9px;

		position: relative;
		isolation: isolate;

		&.sm {
			--fill-y: 3px;
			--fill-x: 9px;
			--dot: 7px;
		}

		&.lg {
			--fill-y: 9px;
			--fill-x: 21px;
			--dot: 12px;
		}

		// At rest the fill is a small square in the space left of the text. On hover it grows to the link's height, then
		// to its width; on leaving the width goes first, then the height.
		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: calc(-1 * var(--fill-x) - 4px);
			z-index: -1;
			width: var(--dot);
			height: var(--dot);
			translate: 0 -50%;
			border-radius: 2px;
			background: var(--color-link-fill);

			@include mixins.mq-motion-allow {
				transition:
					width 0.4s var(--ease),
					left 0.4s var(--ease),
					height 0.3s var(--ease) 0.15s,
					border-radius 0.3s var(--ease) 0.15s;
			}
		}

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				color 0.2s var(--ease),
				border-color var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			color: var(--color-link-fill-text);

			&::before {
				left: calc(-1 * var(--fill-x));
				width: calc(100% + 2 * var(--fill-x));
				height: calc(100% + 2 * var(--fill-y));
				border-radius: var(--radius-btn);

				@include mixins.mq-motion-allow {
					transition:
						height 0.3s var(--ease),
						border-radius 0.3s var(--ease),
						left 0.5s var(--ease) 0.05s,
						width 0.5s var(--ease) 0.05s;
				}
			}

			@include mixins.mq-motion-allow {
				transition:
					background var(--duration) var(--ease),
					color 0.3s var(--ease) 0.1s,
					border-color var(--duration) var(--ease),
					scale var(--duration) var(--ease);
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
		aspect-ratio: 1;
		padding: var(--btn-padding-icon);

		// The roll wraps the icon in inline spans, whose line box is taller than the icon.
		:global(.roll__front),
		:global(.roll__back) {
			display: flex;
		}
	}
</style>
