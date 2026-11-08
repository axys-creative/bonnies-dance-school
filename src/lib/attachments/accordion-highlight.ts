import type { Attachment } from 'svelte/attachments';
import './accordion-highlight.scss';

const TRIGGER = '.heading > button';

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/** A primary-colored shape follows the hovered or focused accordion title, bending in the direction it travels between items. */
export function accordionHighlight(): Attachment<HTMLElement> {
	return (root) => {
		if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svg.classList.add('accordion-highlight-shape');
		svg.setAttribute('aria-hidden', 'true');
		svg.append(path);
		root.classList.add('accordion-highlight');
		root.prepend(svg);

		let hovered: HTMLElement | null = null;
		let focused: HTMLElement | null = null;
		let active: HTMLElement | null = null;
		let top = 0;
		let height = 0;
		let velocity = 0;
		let bend = 0;
		let targetTop = 0;
		let targetHeight = 0;
		let shown = false;
		let idle = 0;
		let frame = 0;
		let last = 0;

		const draw = () => {
			if (height < 0.5) {
				path.removeAttribute('d');
				return;
			}
			const width = root.clientWidth;
			const bottom = top + height;
			path.setAttribute(
				'd',
				`M0 ${top} Q${width / 2} ${top + bend * 2} ${width} ${top}` +
					` L${width} ${bottom} Q${width / 2} ${bottom + bend * 2} 0 ${bottom}Z`
			);
		};

		const tick = (now: number) => {
			frame = 0;
			const dt = Math.min(2, (now - last) / 16.67 || 1);
			last = now;
			const base = root.getBoundingClientRect().top;

			if (active) {
				const rect = active.getBoundingClientRect();
				targetTop = rect.top - base;
				targetHeight = rect.height;
				if (!shown) {
					top = targetTop;
					height = velocity = bend = 0;
					shown = true;
				}
			} else {
				targetHeight = 0;
			}

			if (still) {
				top = targetTop;
				height = targetHeight;
				velocity = bend = 0;
			} else {
				velocity = (velocity + (targetTop - top) * 0.09 * dt) * 0.76 ** dt;
				top += velocity * dt;
				height += (targetHeight - height) * 0.16 * dt;
				// Both edges sag down while moving down (a U) and arch up while moving up.
				bend += (clamp(velocity * 2.5, 26) - bend) * 0.2 * dt;
			}
			draw();

			const moving =
				Math.abs(targetTop - top) +
					Math.abs(targetHeight - height) +
					Math.abs(velocity) +
					Math.abs(bend) >
				0.2;
			idle = moving ? 0 : idle + 1;
			if (!active && !moving) {
				shown = false;
				path.removeAttribute('d');
				return;
			}
			if (idle < 30) frame = requestAnimationFrame(tick);
		};

		const kick = () => {
			idle = 0;
			if (!frame) {
				last = performance.now();
				frame = requestAnimationFrame(tick);
			}
		};

		const update = () => {
			active = hovered ?? focused;
			for (const trigger of root.querySelectorAll<HTMLElement>(TRIGGER)) {
				trigger.toggleAttribute('data-active', trigger === active);
			}
			kick();
		};

		const trigger = (event: Event) => {
			const found = (event.target as Element).closest<HTMLElement>(TRIGGER);
			return found && root.contains(found) ? found : null;
		};

		const onOver = (event: PointerEvent) => {
			const found = trigger(event);
			if (found && found !== hovered) {
				hovered = found;
				update();
			}
		};
		const onLeave = () => {
			hovered = null;
			update();
		};
		const onFocusIn = (event: FocusEvent) => {
			const found = trigger(event);
			if (found?.matches(':focus-visible')) {
				focused = found;
				update();
			}
		};
		const onFocusOut = () => {
			focused = null;
			update();
		};

		root.addEventListener('pointerover', onOver);
		root.addEventListener('pointerleave', onLeave);
		root.addEventListener('focusin', onFocusIn);
		root.addEventListener('focusout', onFocusOut);
		root.addEventListener('transitionrun', kick);
		window.addEventListener('resize', kick);

		return () => {
			root.removeEventListener('pointerover', onOver);
			root.removeEventListener('pointerleave', onLeave);
			root.removeEventListener('focusin', onFocusIn);
			root.removeEventListener('focusout', onFocusOut);
			root.removeEventListener('transitionrun', kick);
			window.removeEventListener('resize', kick);
			cancelAnimationFrame(frame);
			for (const el of root.querySelectorAll(TRIGGER)) el.removeAttribute('data-active');
			root.classList.remove('accordion-highlight');
			svg.remove();
		};
	};
}
