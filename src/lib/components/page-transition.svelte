<script module lang="ts">
	import type { PageTransitionOptions } from '$lib/utils/page-transition';

	export type PageTransitionProps = PageTransitionOptions;
</script>

<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { playSwipe, prefersReducedMotion } from '$lib/utils/page-transition';

	let options: PageTransitionProps = $props();

	// SvelteKit waits for the promise this returns before it swaps the page.
	onNavigate((navigation) => {
		if (prefersReducedMotion()) return;

		const pages = [...document.querySelectorAll('#main, footer')];
		const header = document.querySelector('.site > header');
		return new Promise<void>((resolve) => {
			playSwipe(
				pages,
				header,
				async () => {
					resolve();
					await navigation.complete;
				},
				options
			);
		});
	});
</script>
