export type PageTransitionOptions = {
	/** Keeps the header in place and on top while the page changes. */
	preserveHeader?: boolean;
	/** Milliseconds each half takes: the page leaving, then the page arriving. */
	duration?: number;
	/** How far the page travels, in px. */
	distance?: number;
	/** How far below the header starts when the new page arrives, in px. It leaves by `distance`. */
	headerDistance?: number;
	/** Any CSS color. */
	color?: string;
};

export const pageTransitionEase = 'cubic-bezier(0.6, 0, 0.07, 1)';

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A frame the color of the page rises from the bottom to cover the window while the page slides up; `swap` runs while
 * it is covered, then the new page fades in, rising from the same distance below. The `header` slides up with the page,
 * out of the top of the window, then fades back in with the new page.
 */
export async function playSwipe(
	pages: Element[],
	header: Element | null,
	swap: () => Promise<void> | void,
	{
		preserveHeader = false,
		duration = 1500,
		distance = 128,
		headerDistance = 48,
		color = 'var(--color-bg)'
	}: PageTransitionOptions = {}
) {
	const timing = { duration, easing: pageTransitionEase, fill: 'both' } as const;
	const up = [{ translate: '0 0' }, { translate: `0 -${distance}px` }];
	const arrive = (offset: number) => [
		{ opacity: 0, translate: `0 ${offset}px` },
		{ opacity: 1, translate: '0 0' }
	];

	const frame = document.createElement('div');
	frame.setAttribute('aria-hidden', 'true');
	frame.style.cssText = `position:fixed;inset:0;z-index:${preserveHeader ? 'calc(var(--z-header) - 1)' : 100};background:${color};pointer-events:none;clip-path:inset(100% 0 0 0);`;
	document.body.append(frame);

	try {
		const leaving = [
			frame.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], timing),
			...pages.map((page) => page.animate(up, timing)),
			...(header ? [header.animate(up, timing)] : [])
		];
		await Promise.all(leaving.map((animation) => animation.finished));

		await swap();

		const arriving = [
			...pages.map((page) => page.animate(arrive(distance), timing)),
			...(header ? [header.animate(arrive(headerDistance), timing)] : [])
		];
		leaving.forEach((animation) => animation.cancel());
		frame.remove();
		await Promise.all(arriving.map((animation) => animation.finished));
		arriving.forEach((animation) => animation.cancel());
	} finally {
		frame.remove();
	}
}
