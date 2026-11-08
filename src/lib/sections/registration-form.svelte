<script module lang="ts">
	export type RegistrationFormProps = {
		/** The fees, shown beside the form. */
		tuition?: {
			items: { label: string; value: string; note?: string }[];
			footnote?: string;
		};
		/** The step names, in order: the students, the family, the policies. */
		steps?: string[];
		/** The policies, one per paragraph, shown in the last step. */
		policies?: string[];
		/** The sentence the visitor agrees to by ticking the box. */
		agreement?: string;
		submitText?: string;
		/** The Netlify form name. */
		name?: string;
		/** The page to go to after submitting. */
		action?: string;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import Button from '$lib/components/button.svelte';
	import FormChoice from '$lib/components/form-choice.svelte';
	import FormField from '$lib/components/form-field.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import Tag from '$lib/components/tag.svelte';

	let {
		tuition,
		steps = ['Students', 'Family', 'Policies'],
		policies = [],
		agreement = 'I have read, understand, and agree with Bonnie’s Dance School Policies.',
		submitText = 'Submit registration',
		name = 'registration',
		action = '/form-submit',
		id,
		class: className
	}: RegistrationFormProps = $props();

	const MAX_STUDENTS = 10;
	const students = Array.from({ length: MAX_STUDENTS }, (_, index) => index + 1);
	const MAX_CONTACTS = 6;
	const contacts = Array.from({ length: MAX_CONTACTS }, (_, index) => index + 1);

	let step = $state(0);
	let studentCount = $state(1);
	let contactCount = $state(1);
	let signedOn = $state('');
	let errors = $state<Record<string, string>>({});
	let form = $state<HTMLFormElement>();

	onMount(() => {
		const now = new Date();
		const pad = (value: number) => String(value).padStart(2, '0');
		signedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	});

	// Checks the visible step before moving on, and puts each problem under its own field.
	function valid() {
		const fields = Array.from(
			form!.querySelectorAll<HTMLInputElement>(
				`[data-step="${step}"] input, [data-step="${step}"] textarea`
			)
		).filter((field) => !field.disabled);
		const next: Record<string, string> = {};
		for (const field of fields) {
			if (!field.checkValidity()) next[field.name] = field.validationMessage;
		}
		errors = next;
		if (Object.keys(next).length) {
			form!.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
			return false;
		}
		return true;
	}

	const motion = (ms: number) =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
			? 0
			: ms;

	function removeLast(kind: 'students' | 'contacts') {
		const count = kind === 'students' ? studentCount : contactCount;
		const group = form?.querySelectorAll<HTMLElement>(
			`[data-step="${kind === 'students' ? 0 : 1}"] .student`
		)[count - 1];
		for (const field of group?.querySelectorAll<HTMLInputElement>('input, textarea, select') ??
			[]) {
			field.value = '';
			field.dispatchEvent(new Event('input', { bubbles: true }));
		}
		errors = {};
		if (kind === 'students') studentCount -= 1;
		else contactCount -= 1;
	}

	async function go(to: number) {
		if (to > step && !valid()) return;
		step = to;
		errors = {};
		await tick();
		form
			?.querySelector<HTMLElement>(`[data-step="${step}"] legend`)
			?.focus({ preventScroll: true });
		form?.scrollIntoView({ block: 'start' });
	}

	function onsubmit(event: SubmitEvent) {
		if (step < steps.length - 1) {
			event.preventDefault();
			go(step + 1);
			return;
		}
		if (!valid()) {
			event.preventDefault();
			return;
		}
		// Locally nothing receives the form, so go straight to the thank-you page.
		if (dev) {
			event.preventDefault();
			goto(action);
		}
	}
</script>

<section {id} class="registration-form {className ?? ''}">
	<div class="inner">
		<aside class="aside" aria-label="Tuition">
			{#if tuition?.items.length}
				<div class="tuition">
					<dl>
						{#each tuition.items as item, index (index)}
							<div class="fee">
								<dt>{item.label}</dt>
								<dd>{item.value}</dd>
								{#if item.note}<p class="note">{item.note}</p>{/if}
							</div>
						{/each}
					</dl>
					{#if tuition.footnote}<p class="note">{tuition.footnote}</p>{/if}
				</div>
			{/if}
		</aside>

		<div class="panel">
			<ol class="progress" aria-label="Registration steps">
				{#each steps as label, index (index)}
					<li aria-current={index === step ? 'step' : undefined}>
						<Tag
							text="{index + 1}. {label}"
							type={index === step ? 'solid' : 'outline'}
							class={index > step ? 'upcoming' : ''}
						/>
					</li>
				{/each}
			</ol>

			<form
				bind:this={form}
				class="form"
				{name}
				method="POST"
				{action}
				data-netlify="true"
				data-netlify-honeypot="bot-field"
				novalidate
				{onsubmit}
			>
				<input type="hidden" name="form-name" value={name} />
				<p class="visually-hidden" aria-hidden="true">
					<label
						>Leave this empty: <input name="bot-field" tabindex="-1" autocomplete="off" /></label
					>
				</p>

				<fieldset data-step="0" hidden={step !== 0}>
					<legend class="h5" tabindex="-1">Student information</legend>

					{#each students as number (number)}
						<div class="student" hidden={number > studentCount}>
							{#if number > 1}<p class="label">Student {number}</p>{/if}
							<FormField
								variant="solid"
								name="student-{number}-name"
								label="Name"
								autocomplete="off"
								required={number === 1}
								disabled={number > studentCount}
								error={errors[`student-${number}-name`]}
							/>
							<div class="group">
								<FormField
									variant="solid"
									name="student-{number}-age"
									label="Age"
									type="number"
									inputmode="numeric"
									required={number === 1}
									disabled={number > studentCount}
									error={errors[`student-${number}-age`]}
								/>
								<FormField
									variant="solid"
									name="student-{number}-dob"
									label="Date of birth"
									type="date"
									required={number === 1}
									disabled={number > studentCount}
									error={errors[`student-${number}-dob`]}
								/>
							</div>
						</div>
					{/each}
				</fieldset>

				<fieldset data-step="1" hidden={step !== 1}>
					<legend class="h5" tabindex="-1">Parent / guardian</legend>
					<FormField
						variant="solid"
						name="guardian-name"
						label="Name(s)"
						autocomplete="name"
						error={errors['guardian-name']}
					/>
					<FormField
						variant="solid"
						name="guardian-phone"
						label="Phone"
						type="tel"
						inputmode="numeric"
						autocomplete="tel"
						error={errors['guardian-phone']}
					/>
					<FormField
						variant="solid"
						name="guardian-address"
						label="Address"
						autocomplete="street-address"
						error={errors['guardian-address']}
					/>
					<FormField
						variant="solid"
						name="guardian-email"
						label="Email"
						type="email"
						autocomplete="email"
						error={errors['guardian-email']}
					/>

					<p class="label">Emergency contacts, other than a parent or guardian</p>
					{#each contacts as number (number)}
						<div class="student" hidden={number > contactCount}>
							{#if number > 1}<p class="label">Contact {number}</p>{/if}
							<FormField
								variant="solid"
								name="emergency-{number}-name"
								label="Name"
								required={number === 1}
								disabled={number > contactCount}
								error={errors[`emergency-${number}-name`]}
							/>
							<FormField
								variant="solid"
								name="emergency-{number}-phone"
								label="Phone"
								type="tel"
								inputmode="numeric"
								required={number === 1}
								disabled={number > contactCount}
								error={errors[`emergency-${number}-phone`]}
							/>
						</div>
					{/each}
				</fieldset>

				<fieldset data-step="2" hidden={step !== 2}>
					<legend class="h5" tabindex="-1">Policies</legend>
					<ul class="policies">
						{#each policies as policy, index (index)}
							<li><RichText text={policy} /></li>
						{/each}
					</ul>

					<FormChoice name="agreed" label={agreement} required />
					{#if errors['agreed']}<p class="error" role="alert">{errors['agreed']}</p>{/if}

					<FormField
						variant="solid"
						name="signature"
						label="Signature (type your full name)"
						autocomplete="name"
						error={errors['signature']}
					/>
					<div class="group">
						<FormField
							variant="solid"
							name="printed-name"
							label="Print name"
							autocomplete="name"
							error={errors['printed-name']}
						/>
						<FormField
							variant="solid"
							name="signed-on"
							label="Date"
							type="date"
							bind:value={signedOn}
							error={errors['signed-on']}
						/>
					</div>
				</fieldset>

				<div class="actions">
					<div class="adders">
						{#if step === 0 && studentCount > 1}
							<div
								class="remove"
								transition:slide={{ axis: 'x', duration: motion(300), easing: cubicOut }}
							>
								<div transition:fade={{ duration: motion(300) }}>
									<Button
										text="Remove student"
										type="solid"
										tone="tertiary"
										onclick={() => removeLast('students')}
									/>
								</div>
							</div>
						{/if}
						{#if step === 0 && studentCount < MAX_STUDENTS}
							<div class="add" transition:fade={{ duration: motion(300) }}>
								<Button
									text="Add student"
									type="text"
									iconEnd="plus"
									onclick={() => (studentCount += 1)}
								/>
							</div>
						{/if}
						{#if step === 1 && contactCount > 1}
							<div
								class="remove"
								transition:slide={{ axis: 'x', duration: motion(300), easing: cubicOut }}
							>
								<div transition:fade={{ duration: motion(300) }}>
									<Button
										text="Remove contact"
										type="solid"
										tone="tertiary"
										onclick={() => removeLast('contacts')}
									/>
								</div>
							</div>
						{/if}
						{#if step === 1 && contactCount < MAX_CONTACTS}
							<div class="add" transition:fade={{ duration: motion(300) }}>
								<Button
									text="Add contact"
									type="text"
									iconEnd="plus"
									onclick={() => (contactCount += 1)}
								/>
							</div>
						{/if}
					</div>
					{#if step > 0}
						<Button text="Back" type="underline" onclick={() => go(step - 1)} />
					{/if}
					<Button
						text={step < steps.length - 1 ? 'Continue' : submitText}
						htmlType="submit"
						iconEnd="arrow-tr"
					/>
				</div>
			</form>
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.registration-form {
		padding-block: calc(var(--section-space-start) / 2) var(--section-space-end);
	}

	.inner {
		display: grid;
		gap: 64px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;

		@include mixins.min-lg {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
			gap: var(--body-padding);
			align-items: start;
		}
	}

	.aside {
		display: flex;
		flex-direction: column;
		gap: 24px;

		@include mixins.min-lg {
			position: sticky;
			top: 120px;
		}
	}

	.tuition {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);

		dl {
			display: grid;
			gap: 16px;
			width: 100%;
			margin: 0;
		}

		.fee {
			display: grid;
			grid-template-columns: 1fr auto;
			column-gap: 16px;
			padding-block-end: 16px;
			border-bottom: 1px solid var(--color-border);

			&:last-child {
				padding-block-end: 0;
				border-bottom: 0;
			}
		}

		dt {
			font-weight: 700;
		}

		dd {
			margin: 0;
			font-weight: 700;
		}

		.note {
			grid-column: 1 / -1;
			margin: 4px 0 0;
			color: var(--color-text-muted);
			font-size: 14px;
		}

		> .note {
			margin: 0;
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.progress {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;

		// Plum, so the current step does not look like the maroon buttons.
		--color-accent: var(--color-secondary);
		--color-accent-text: var(--color-secondary);

		li :global(.tag) {
			padding: 8px 16px;
		}

		:global(.upcoming) {
			opacity: 0.6;
		}
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;

		&[hidden] {
			display: none;
		}
	}

	legend {
		margin-block-end: 24px;
		padding: 0;

		&:focus {
			outline: none;
		}
	}

	.student {
		display: flex;
		flex-direction: column;
		gap: 8px;

		& + & {
			margin-top: 32px;
		}

		&[hidden] {
			display: none;
		}
	}

	.label {
		margin: 8px 0 0;
		color: var(--color-text-muted);
		font-weight: 700;
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 12px;
		width: 100%;

		:global(.field) {
			flex: 1 1 12rem;
		}
	}

	.adders {
		display: flex;
		align-items: center;
		margin-inline-end: auto;
	}

	// A text button's square sits 17px left of its label, so the square, not the label, lines up with the form edge.
	.add {
		margin-inline-start: 17px;
	}

	.remove {
		display: flex;
		margin-inline-end: 16px;
		white-space: nowrap;
	}

	.policies {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-height: 24rem;
		margin: 0;
		padding: 24px 24px 24px 40px;
		overflow-y: auto;
		border-radius: var(--radius);
		background: var(--color-surface);
		font-size: 16px;

		li {
			padding-inline-start: 8px;
		}
	}

	.error {
		margin: 0;
		color: var(--color-error);
		font-size: 14px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 24px;
	}
</style>
