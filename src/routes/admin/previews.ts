import type { Component } from 'svelte';
import globalCss from '../../styles/styles.scss?inline';
import CardsThree from '$lib/sections/cards-three.svelte';
import reviews from '$lib/content/global/reviews.json';
import RegistrationForm from '$lib/sections/registration-form.svelte';
import TestimonialsGrid from '$lib/sections/testimonials-grid.svelte';
import MarqueeTestimonials from '$lib/sections/marquee-testimonials.svelte';
import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
import Tunnel from '$lib/sections/tunnel.svelte';
import HeadlineJumbled from '$lib/sections/headline-jumbled.svelte';
import HeroLoadMarqueeSlide from '$lib/sections/hero-load-marquee-slide.svelte';
import StatsSticky from '$lib/sections/stats-sticky.svelte';
import CopySplit from '$lib/sections/copy-split.svelte';
import HeroAbout from '$lib/sections/hero-about.svelte';
import ImageHalf from '$lib/sections/image-half.svelte';
import Faq from '$lib/sections/faq.svelte';
import HeroSimple from '$lib/sections/hero-simple.svelte';
import { mountPreview, type PreviewHost } from './preview-host.svelte';

type Data = Record<string, unknown>;
type Section = Component<Data>;
type Preview = { component: Section; props?: (data: Data) => Data };

type Cms = { registerPreviewTemplate: (name: string, template: unknown) => void };
type Entry = { getIn: (path: string[]) => { toJS: () => Data } };
type Instance = {
	props: { entry: Entry };
	host?: PreviewHost;
	observer?: MutationObserver;
	root?: HTMLElement | null;
};
type CreateClass = (spec: Record<string, unknown>) => unknown;
type H = (tag: string, props?: Record<string, unknown>) => unknown;

// Keyed by the file's `name` in config.json; `props` mirrors what the real page passes.
const previews: Record<string, Preview> = {
	cards_three: {
		component: CardsThree as unknown as Section,
		props: (data) => ({ ...data, cards: data.cards ?? [], static: true })
	},
	marquee_testimonials: {
		component: MarqueeTestimonials as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: { text?: string } };
			return {
				...data,
				cta: cta.primary?.text ? cta : undefined,
				testimonials: reviews.reviews.slice(0, 6)
			};
		}
	},
	registration_form: {
		component: RegistrationForm as unknown as Section,
		props: (data) => ({
			...data,
			tuition: data.tuition ?? { items: [] },
			policies: data.policies ?? []
		})
	},
	testimonials_grid: {
		component: TestimonialsGrid as unknown as Section,
		props: (data) => ({ ...data, testimonials: reviews.reviews, static: true })
	},
	carousel_spotlight: {
		component: CarouselSpotlight as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: unknown; secondary?: { text?: string } };
			return {
				...data,
				cta: { ...cta, secondary: cta.secondary?.text ? cta.secondary : undefined },
				slides: data.slides ?? [],
				still: true,
				autoplay: false
			};
		}
	},
	location: {
		component: HeroAbout as unknown as Section,
		props: (data) => ({ ...data, level: 2 })
	},
	tunnel: {
		component: Tunnel as unknown as Section,
		props: (data) => ({ ...data, static: true })
	},
	headline_jumbled: {
		component: HeadlineJumbled as unknown as Section,
		props: (data) => ({ ...data, lines: data.lines ?? [], static: true })
	},
	hero_load_marquee_slide: {
		component: HeroLoadMarqueeSlide as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: unknown; secondary?: { text?: string } };
			const heading = (data.heading ?? {}) as { before?: string; words?: string[]; after?: string };
			return {
				...data,
				words: [heading.before ?? '', heading.words ?? [], heading.after ?? ''],
				cta: { ...cta, secondary: cta.secondary?.text ? cta.secondary : undefined },
				static: true
			};
		}
	},
	hero_about: { component: HeroAbout as unknown as Section },
	image_half: { component: ImageHalf as unknown as Section },
	copy_split: { component: CopySplit as unknown as Section },
	stats_sticky: {
		component: StatsSticky as unknown as Section,
		props: (data) => ({ ...data, stats: data.stats ?? [], static: true })
	},
	faq: {
		component: Faq as unknown as Section,
		props: (data) => ({ ...data, items: data.items ?? [], static: true })
	},
	hero_simple: {
		component: HeroSimple as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: unknown; secondary?: { text?: string } };
			return {
				...data,
				static: true,
				cta: { ...cta, secondary: cta.secondary?.text ? cta.secondary : undefined }
			};
		}
	}
};

const componentStyles =
	'style[data-vite-dev-id]:not([data-vite-dev-id*="/admin/"]), link[href*="/_app/"][rel="stylesheet"]';

function syncStyles(doc: Document) {
	const upsert = (key: string, build: () => HTMLElement, update?: (el: HTMLElement) => void) => {
		let el = doc.head.querySelector<HTMLElement>(`[data-preview-key="${CSS.escape(key)}"]`);
		if (!el) {
			el = build();
			el.dataset.previewKey = key;
			doc.head.append(el);
		}
		update?.(el);
	};

	upsert(
		'global',
		() => doc.createElement('style'),
		(el) => {
			if (el.textContent !== globalCss) el.textContent = globalCss;
		}
	);

	upsert(
		'preview-spacing',
		() => doc.createElement('style'),
		(el) => {
			el.textContent =
				':root { --section-space-start: calc(var(--section-space) / 2); --section-space-end: calc(var(--section-space) / 2); }';
		}
	);

	document.head.querySelectorAll<HTMLElement>(componentStyles).forEach((source, index) => {
		const key = source.dataset.viteDevId ?? (source as HTMLLinkElement).href ?? String(index);
		if (source instanceof HTMLLinkElement) {
			upsert(key, () => {
				const link = doc.createElement('link');
				link.rel = 'stylesheet';
				link.href = source.href;
				return link;
			});
			return;
		}
		upsert(
			key,
			() => doc.createElement('style'),
			(el) => {
				if (el.textContent !== source.textContent) el.textContent = source.textContent;
			}
		);
	});
}

function dataOf(instance: Instance, preview: Preview): Data {
	const data = instance.props.entry.getIn(['data']).toJS();
	return preview.props ? preview.props(data) : data;
}

function template(preview: Preview) {
	const { createClass, h } = window as unknown as { createClass: CreateClass; h: H };

	return createClass({
		componentDidMount(this: Instance) {
			const root = this.root;
			if (!root) return;
			const doc = root.ownerDocument;
			doc.documentElement.dataset.theme = document.documentElement.dataset.theme ?? '';
			syncStyles(doc);
			this.observer = new MutationObserver(() => syncStyles(doc));
			this.observer.observe(document.head, { childList: true, subtree: true, characterData: true });
			this.host = mountPreview(root, preview.component, dataOf(this, preview));
		},
		componentDidUpdate(this: Instance) {
			this.host?.update(dataOf(this, preview));
		},
		componentWillUnmount(this: Instance) {
			this.observer?.disconnect();
			this.host?.destroy();
		},
		render(this: Instance) {
			return h('div', {
				style: {
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center'
				},
				ref: (el: HTMLElement | null) => {
					this.root = el;
				}
			});
		}
	});
}

export function registerPreviews(cms: Cms) {
	for (const [name, preview] of Object.entries(previews)) {
		cms.registerPreviewTemplate(name, template(preview));
	}
}
