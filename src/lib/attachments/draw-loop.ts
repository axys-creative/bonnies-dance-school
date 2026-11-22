import type { Attachment } from 'svelte/attachments';

export type DrawLoopOptions = {
	/** How long the finished drawing stays, in ms. */
	hold?: number;
	/** How long one line takes to draw, in ms. */
	draw?: number;
	/** How long one line takes to rub out, in ms. */
	erase?: number;
	/** How far apart the lines start, in ms. */
	spread?: number;
	/** How long to wait after the icon scrolls into view before it starts, in ms. */
	delay?: number;
};

const GOLDEN = 0.618034;
const frac = (n: number) => n - Math.floor(n);

/** Once scrolled into view, draws every line of an inline SVG on, holds, rubs them off in the same direction, and repeats. */
export function drawLoop({
	hold = 3000,
	draw = 1000,
	erase = 700,
	spread = 1100,
	delay = 0
}: DrawLoopOptions = {}): Attachment<SVGSVGElement> {
	return (svg) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const shapes = Array.from(svg.children) as SVGGeometryElement[];
		const total = spread + draw + hold + spread + erase;
		const at = (ms: number) => Math.min(ms / total, 1);
		const tick = 16 / total;
		const hidden = 1.1;

		const animations = shapes.map((shape, index) => {
			const dotted = shape.hasAttribute('stroke-dasharray');
			const inStart = frac(index * GOLDEN) * spread;
			const inLength = draw * (0.7 + 0.3 * frac(index * GOLDEN * 3));
			const outStart = spread + draw + hold + frac(index * GOLDEN * 2 + 0.3) * spread;
			const outLength = erase * (0.7 + 0.3 * frac(index * GOLDEN * 5));

			if (dotted) {
				return shape.animate(
					[
						{ offset: 0, opacity: 0 },
						{ offset: at(inStart), opacity: 0 },
						{ offset: at(inStart + inLength), opacity: 1 },
						{ offset: at(outStart), opacity: 1 },
						{ offset: at(outStart + outLength), opacity: 0 },
						{ offset: 1, opacity: 0 }
					],
					{ duration: total, iterations: Infinity }
				);
			}

			shape.setAttribute('pathLength', '1');
			shape.style.strokeDasharray = '1 2';

			const frame = (offset: number, opacity: number, dash: number): Keyframe => ({
				offset,
				opacity,
				strokeDashoffset: dash,
				easing: 'ease-in-out'
			});

			return shape.animate(
				[
					frame(0, 0, hidden),
					frame(at(inStart), 0, hidden),
					frame(at(inStart) + tick, 1, hidden),
					frame(at(inStart + inLength), 1, 0),
					frame(at(outStart), 1, 0),
					frame(at(outStart + outLength) - tick, 1, -hidden),
					frame(at(outStart + outLength), 0, -hidden),
					frame(1, 0, -hidden)
				],
				{ duration: total, iterations: Infinity }
			);
		});

		animations.forEach((animation) => animation.pause());

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				animations.forEach((animation) => {
					animation.effect?.updateTiming({ delay });
					animation.play();
				});
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		observer.observe(svg);

		return () => {
			observer.disconnect();
			animations.forEach((animation) => animation.cancel());
		};
	};
}
