import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextRevealOptions = TextScrollOptions & {
	type?: 'chars' | 'words';
	/** The side the pieces slide in from. */
	from?: 'bottom' | 'top';
	/** Seconds each piece takes to slide in. */
	duration?: number;
	/** Seconds between each piece starting. */
	stagger?: number;
	/** A GSAP ease, e.g. `back.out(2)`. */
	ease?: string;
	/** Seconds to wait after the trigger fires before the first piece starts. */
	delay?: number;
	/** Degrees each word starts rotated by (negative turns the other way), swinging back to 0 from its left corner as its first piece starts. */
	rotate?: number;
};

/** Slides text up out of a clipped line, piece by piece, as it scrolls into view. */
export function textReveal({
	type = 'words',
	from = 'bottom',
	duration = 0.2,
	stagger = 0.05,
	ease = 'linear',
	delay = 0,
	rotate = 0,
	...scroll
}: TextRevealOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			el.dataset.revealReady = '';
			return;
		}

		return textScroll(
			el,
			rotate && type === 'chars' ? 'words,chars' : type,
			scroll,
			({ gsap, targets, scrollTrigger, split }) => {
				// Pieces slide in from the top pivot on their top left corner, from the bottom on their bottom left.
				const origin = from === 'top' ? '0% 0%' : '0% 100%';
				const timeline = gsap
					.timeline({ scrollTrigger, delay })
					.fromTo(
						targets,
						{ y: from === 'top' ? '-100%' : '100%', rotate: type === 'words' ? rotate : 0 },
						{ y: '0%', rotate: 0, duration, stagger, ease }
					);
				if (type === 'words') {
					gsap.set(targets, { transformOrigin: origin });
				} else if (rotate && split?.words) {
					// A word swings as one piece, starting when its first letter does.
					for (const word of split.words as HTMLElement[]) {
						const first = targets.findIndex((char) => word.contains(char));
						timeline.fromTo(
							word,
							{ rotate, transformOrigin: origin },
							{ rotate: 0, duration, ease },
							Math.max(first, 0) * stagger
						);
					}
				}
				return timeline;
			},
			true
		);
	};
}

/** The reveal every page's H1 uses: letter by letter, each word swinging up from a slight tilt. */
export const headingReveal = (options: TextRevealOptions = {}) =>
	textReveal({
		type: 'chars',
		rotate: 5,
		duration: 0.8,
		stagger: 0.04,
		ease: 'power3.out',
		delay: 0.3,
		once: true,
		...options
	});
