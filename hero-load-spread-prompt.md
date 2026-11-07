Add the "Hero Load Spread" intro and its "Links" header from the Bonnie's Dance School project to this template.

Copy these files from `/Users/aarongarcia/Desktop/work/axys-creative/projects/bonnies-dance-school` into the same paths here:
- `src/lib/sections/hero-load-spread.svelte`
- `src/lib/components/header-links.svelte`
- `src/lib/components/site-nav.svelte` (only the new `left` variant; merge it into the existing file)
- `src/lib/content/global/header-links.json`

What they do:
- The hero is a full-screen section with three words (`words: [string, string, string]`). The words reveal letter by letter with `textReveal()` in one centered line. The first word then slides to the far left and the last to the far right. Then the first rises to the top-left corner and the last drops to the bottom-right corner. The middle word never moves. The `description` and `cta` fade in at the bottom left afterwards. It waits on `loading.done`, so it pairs with any loader. With reduced motion, or `static`, it shows the final layout straight away.
- The header is the plain links of `navigation.json` in the top right (dropdown links are skipped) plus its first button, and no logo. Below `lg` it is one "Menu" button that opens a full-screen navigation (a new `left` variant added to `site-nav.svelte`: links left-aligned and vertically centered at 32px, then 40px from `md`; buttons under them; social links at the bottom left).

Wire it up following the CLAUDE.md rules:
1. Header: add `links` to `headerTemplate` (`meta/site.json`) and as a branch in `routes/(site)/+layout.svelte` (import `HeaderLinks` and `header-links.json`, and pass `socialLinks`). Add the "Links" option to the `headerTemplate` select and a `header_links` entry (position, blend, showSkipLink) in `src/routes/admin/config.json`. Set `blend` to `false` in `header-links.json`. Mention `links` in the Headers rule in CLAUDE.md.
2. Home page: render `<HeroLoadSpread id="hero" words={...} description={...} {cta} />` in `routes/(site)/+page.svelte` from a new `src/lib/content/page_home/hero-load-spread.json` (`words` as 3 strings, `description`, `cta.primary` / `cta.secondary`). Replace the `page_home` Hero file in the Decap config with a `hero_load_spread` entry (a `words` list with min 3 and max 3, `description`, `cta`; keep `preview_path` as `#hero`). Remove the old `hero-simple.json` for the home page.
3. Previews: add a `hero_load_spread` entry in `routes/admin/previews.ts` that passes `static: true` and defaults `words` to `['', '', '']`.
4. Library: add a "Hero Load Spread" `LibrarySection` (type Intro, tag Hero) to `/intros`, inside `IntroFrame` with `fullScreen={false}`, and add `heroLoadSpreadProps` to `src/lib/library/component-props.ts`.
5. Write the copy for this site: three words that read as one phrase (the middle word stays centered), a one-line description, and a primary button.

Then run `bun run check` and `bun run lint`, and fix anything that fails because of these changes.
