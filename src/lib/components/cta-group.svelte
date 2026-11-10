<script lang="ts">
	import { roll } from '$lib/attachments/roll';
	import Button, { type ButtonProps } from './button.svelte';

	type Props = {
		primary: Omit<ButtonProps, 'type'>;
		secondary?: Omit<ButtonProps, 'type'>;
		justify?: 'start' | 'center';
	};

	let { primary, secondary, justify = 'start' }: Props = $props();
</script>

<div class="cta-group {justify}">
	{#key primary.text}
		<Button {...primary} iconEnd={primary.iconEnd || 'arrow-tr'} type="solid" {@attach roll()} />
	{/key}
	{#if secondary}
		<Button {...secondary} type="text" />
	{/if}
</div>

<style lang="scss">
	.cta-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cta-group-gap);
	}

	.center {
		justify-content: center;
	}
</style>
