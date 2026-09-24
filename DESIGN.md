---
name: REED Kalisz — Public Website
description: The category standard played straight — a white-ground B2B catalog with one cool neutral ramp and a single red reserved for action.
colors:
  brand-red: "#bf0417"
  brand-red-hover: "#980312"
  brand-red-active: "#72020d"
  brand-wash: "#fbf2f3"
  page-white: "#ffffff"
  surface-subtle: "#f6f7f9"
  surface-sunken: "#eceef2"
  border-hairline: "#dde0e7"
  border-strong: "#c3c8d3"
  ink: "#141821"
  ink-muted: "#4d5565"
  ink-subtle: "#666d7d"
  instock-green: "#14652a"
  status-new-bg: "#e8f1fb"
  status-new-fg: "#17548f"
  status-best-bg: "#fdf2d6"
  status-best-fg: "#7d5200"
  status-soon-bg: "#f4ecfd"
  status-soon-fg: "#63359b"
  status-out-bg: "#eef0f4"
  status-out-fg: "#4d5565"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.75vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  headline:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  title:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "clamp(1.3rem, 1.15rem + 0.7vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  subtitle:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "clamp(1.1rem, 1.03rem + 0.3vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  body:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body-small:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.03em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  full: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.md}"
    padding: "0 {spacing.5}"
    height: "42px"
    typography: "{typography.body-small}"
  button-primary-hover:
    backgroundColor: "{colors.brand-red-hover}"
  button-primary-active:
    backgroundColor: "{colors.brand-red-active}"
  button-primary-disabled:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.page-white}"
  button-submit:
    backgroundColor: "{colors.brand-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.md}"
    padding: "{spacing.3} {spacing.6}"
    height: "44px"
    typography: "{typography.body-small}"
  button-outline:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.2} {spacing.3}"
    typography: "{typography.body-small}"
  input-text:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    typography: "{typography.body-small}"
  input-search:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 {spacing.1} 0 {spacing.3}"
    height: "40px"
    typography: "{typography.body-small}"
  card-product:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
  card-product-out-of-stock:
    backgroundColor: "{colors.surface-subtle}"
  badge-new:
    backgroundColor: "{colors.status-new-bg}"
    textColor: "{colors.status-new-fg}"
    rounded: "{rounded.full}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-sale:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.brand-red-hover}"
    rounded: "{rounded.full}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-bestseller:
    backgroundColor: "{colors.status-best-bg}"
    textColor: "{colors.status-best-fg}"
    rounded: "{rounded.full}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-soon:
    backgroundColor: "{colors.status-soon-bg}"
    textColor: "{colors.status-soon-fg}"
    rounded: "{rounded.full}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-out:
    backgroundColor: "{colors.status-out-bg}"
    textColor: "{colors.status-out-fg}"
    rounded: "{rounded.full}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  nav-item:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "{spacing.2} {spacing.3}"
    typography: "{typography.body-small}"
  nav-item-active:
    textColor: "{colors.brand-red}"
  menu-item-current:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.brand-red}"
    rounded: "{rounded.md}"
    padding: "{spacing.2} {spacing.3}"
    typography: "{typography.body-small}"
  page-number-active:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.brand-red}"
    rounded: "{rounded.md}"
    size: "36px"
    typography: "{typography.body-small}"
---

# Design System: REED Kalisz — Public Website

## Overview

**Creative North Star: "The Well-Run Catalog"**

This is the arrangement a B2B catalog buyer already knows — sticky header with search, category rail on the left, a grid of product cards, a product page that ends in a question — executed to a finish the category rarely reaches. Nothing here is trying to be novel. The system's ambition lives entirely in the finish: one cool neutral ramp doing all the structural work, a single red that earns its rarity, an optical type ramp that fluidly narrows between phone and desktop, and a 4px spacing rhythm that never guesses. Density is catalog-grade: two product cards across on a phone, four beside the rail on a desktop, cards tight enough to compare and loose enough to read.

The world is white-ground and hairline-drawn. Surfaces separate by a 1px cool border before they separate by shadow; shadow is the response to a pointer, not a permanent property of a card. Colour is deliberately scarce — the catalog's own product photography is the only saturated thing on most screens, which is why the chrome around it stays a cool grey and the brand red never becomes a surface fill.

Two contextual facts belong in the record. First: the previous site carried exactly one `@media` rule in its entire source tree and had no mobile layout at all, which is why this system states its responsive rules explicitly and at named breakpoints rather than leaving them to be inferred. Second: the admin panel at `/admin` is a separate system — navy palette, Fira Sans, its own `ui-admin.css` — and nothing in this document applies to it.

**Key Characteristics:**
- White ground, one cool neutral ramp (`--n-0` … `--n-950`), hairline borders before shadows
- One red, reserved: primary action, active state, focus, required marks, errors, sale
- Archivo variable, self-hosted in two subsets; system mono for product and supplier codes
- Fluid `clamp()` type ramp; 4px spacing scale; radii of 4/6/10px and a pill
- Explicit responsive rules at 560 / 640 / 720 / 900 / 1100px
- Inquiry is the terminal action on every product surface; no cart affordances exist anywhere

## Colors

A white page, one cool blue-grey neutral ramp carrying every structural job, and a single saturated red that appears only where the user can act or where the system must answer.

### Primary
- **REED Red** (`#bf0417`): The fixed brand asset. It fills primary buttons (search submit, "Zapytaj o ten produkt", form submit, empty-state CTAs), marks the active nav item and its 2px underline, colours the current category in the rail, paints the focus-visible ring and the caret, flags a required field, sets error text, and prices a sale. Hover deepens to `#980312`, press to `#72020d`. It is never a surface fill and never a large area.
- **Brand Wash** (`#fbf2f3`): The only tinted ground the red is allowed. It backs the current category item, the active page number, an invalid input, the form-level error block, and the admin-only note. A one-step tint, never a block of colour.

### Secondary
- **Stock Green** (`#14652a`): Availability and confirmation only — the in-stock dot and label on the product summary, and the inquiry-sent success panel. It exists specifically so that "we have it" and "we got your message" are not mistaken for "it's on sale".

### Tertiary
Status pills carry their own hue families, each a tinted ground with a same-hue foreground: **Catalog Blue** (`#e8f1fb` / `#17548f`) for new, **Signal Amber** (`#fdf2d6` / `#7d5200`) for bestseller, **Quiet Violet** (`#f4ecfd` / `#63359b`) for coming soon, and **Cool Grey** (`#eef0f4` / `#4d5565`) for out of stock. Sale reuses the brand pair.

### Neutral
- **Page White** (`#ffffff`): The page ground and every card, panel and input surface.
- **Subtle Surface** (`#f6f7f9`): The footer band, the spec table, the promo tile, an out-of-stock card, hover grounds on nav and pagination, and the scrollbar track.
- **Sunken** (`#eceef2`): The deepest grey surface, used sparingly where a well must read as recessed.
- **Hairline** (`#dde0e7`): The default 1px border on cards, inputs, dividers and section rules.
- **Strong Hairline** (`#c3c8d3`): The hover state of any bordered control, and the dashed border on the empty state.
- **Ink** (`#141821`): Headings and body text.
- **Muted Ink** (`#4d5565`): Secondary prose, nav items at rest, link lists, prose body.
- **Subtle Ink** (`#666d7d`): Codes, captions, "od", unit notes, placeholders. Tuned to this exact value so it clears 4.5:1 on white *and* on the subtle surface — it is the darkest-tolerable grey, not a free choice.

### Named Rules
**The Reserved Red Rule.** Red means *act, here* or *this is current*. Primary action, active nav/category, focus ring, required mark, error, sale. That is the whole list. A surface, a heading, a divider or a decorative panel never takes red, and no second accent hue is introduced beside it.

**The Green Is Not A Discount Rule.** Availability and confirmation use Stock Green, never the brand red. A buyer must never read "in stock" as "on sale".

**The Measured Pair Rule.** Every status pill is a tinted ground with a same-hue foreground, measured at ≥6:1. A new status colour ships only after its pair is measured, and subtle ink never goes lighter than `#666d7d`.

## Typography

**Display / Body Font:** Archivo variable (weight 400–800, width 75–125%), self-hosted as `latin` and `latin-ext` woff2 subsets with `font-display: swap`, falling back to `ui-sans-serif, system-ui`
**Label/Mono Font:** the platform mono stack (`ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas`), used exclusively for product and supplier codes

**Character:** One family does everything. Archivo is a grotesque with enough width and enough weight range to make a headline feel set rather than scaled up, and it holds Polish diacritics cleanly at 13px in a card. Headings run bold (700) with a −0.018em optical tuck and balanced wrapping; body runs 400 at 1.55. Synthesised weights are switched off, so the variable axis is the only source of weight.

### Hierarchy
- **Display** (700, fluid 2rem→3.25rem, 1.15): The homepage's lead title, set by the CMS title block.
- **Headline** (700, fluid 1.75rem→2.5rem, 1.15): Page-level `h1` — category name, product name, Kontakt.
- **Title** (700, fluid 1.3rem→1.75rem, 1.15): Product-page section heads ("Opis", "Cennik", "Zapytaj o produkt"), each underlined by a hairline rule.
- **Subtitle** (700, fluid 1.1rem→1.25rem, 1.15): Pricing-block heads, footer column heads, empty-state heads.
- **Body** (400, 1rem, 1.55): Default. CMS prose runs 1.7 line-height capped at 68ch; contact and no-result copy at 46–52ch.
- **Body Small** (400, 0.875rem): The catalog's working size — nav, breadcrumbs, form fields, table cells, pagination, footer links.
- **Label** (700, 0.6875rem, +0.03em, uppercase): Status pills only, plus two field captions ("7 KOLORÓW", the pricing type tag). A functional caption, never a decorative line above a heading.
- **Code** (mono, 0.8125rem, +0.01em, subtle ink): Product and supplier codes, everywhere they appear.

### Named Rules
**The One Family Rule.** Archivo carries every text role. The mono stack exists for one job — codes — and no third family is added.

**The Tabular Number Rule.** Any number that sits in a column or compares against a neighbour (prices, page numbers, quantity breaks, colour counts) takes tabular figures via `.tnum`. Prices align down a card row or they are not aligned at all.

**The Two-Line Clamp Rule.** Product names in a card clamp to two lines with an ellipsis, so every card in a row shares a footer baseline regardless of name length.

## Layout

A single centred container caps at 1400px with a fluid gutter (`clamp(1rem, 0.4rem + 2.2vw, 2.5rem)`), so the page breathes wider as the viewport does rather than stepping. The sticky header is 60px tall and grows to 68px from 900px up; every sticky rail offsets from that token plus 1.5rem, never from a hardcoded number.

Spacing is a strict 4px scale (0.25rem through 6rem). Component internals live in the 2–5 range, block separation in 6–12, page-section separation in 12–24; the footer opens on a 6rem top margin.

Five breakpoints, each doing a specific job:
- **560px** — product cards gain their larger internal padding; the catalog grid leaves its fixed two-column phone layout for an auto-fill from a 210px floor; the CMS tile grid goes from one column to two.
- **640px** — the inquiry form's fields split into two columns (email/phone side by side, name and message full-width); pagination widens its page window from ±1 to ±2.
- **720px** — the footer becomes two (or three, when link columns exist) named columns.
- **900px** — the main breakpoint. Desktop nav and header search appear and the burger and drawer disappear; the category rail becomes a permanent 16rem sticky column beside the listing; the product page splits into a 7fr media column with a sticky rail and a 5fr summary, detail spanning full width below; contact splits 5fr/7fr; the catalog grid drops its auto-fill floor to 200px, which yields four columns beside the rail.
- **1100px** — the category rail widens to 18rem.

**The Catalog Never Single-Columns Rule.** The product grid is two columns on the narrowest phone. One column turns twenty-five products into a mile of scroll, so the fixed two-column floor holds below 560px and auto-fill takes over above it.

**The Authored Placement Rule.** The CMS tile grid honours REED's authored 4-column placement from 900px up, untouched. Below that it linearises to two columns (one below 560px) via a `max-width` query using `!important`, because `Tile.svelte` writes grid placement as an inline style and nothing weaker can override it. The override lives in the narrow query so desktop is never "undone".

**The Tile Sizes Itself Rule.** A CMS tile spans one to four columns, so its text scales to the tile via container queries (`cqw`), not to the viewport. Tile titles run `clamp(1.125rem, 8.5cqw, 2.5rem)` and tile padding `clamp(0.75rem, 4cqw, 1.75rem)`.

## Elevation & Depth

Hybrid, leaning flat. At rest the system separates surfaces with a 1px cool hairline and a tonal step (white card on white page; subtle-grey footer, spec table and out-of-stock card). Shadow is reserved for two situations: something that is floating over the page by construction (the mobile drawer), and something responding to a pointer (a card or tile lifting on hover). All three shadows are two-layer — a tight contact offset plus a wide soft blur — tinted with the neutral ramp's darkest ink (`rgba(20, 24, 33, …)`) rather than pure black, so they sit cool against the grey.

### Shadow Vocabulary
- **Contact** (`box-shadow: 0 1px 2px rgba(20,24,33,0.06), 0 1px 3px rgba(20,24,33,0.08)`): The sticky header once the page has scrolled past 4px, alongside its border appearing.
- **Lift** (`box-shadow: 0 2px 4px rgba(20,24,33,0.05), 0 8px 20px rgba(20,24,33,0.09)`): Product card, promo tile and CMS tile on hover, paired with a −2/−3px translate.
- **Float** (`box-shadow: 0 4px 8px rgba(20,24,33,0.06), 0 16px 40px rgba(20,24,33,0.12)`): The mobile drawer, which genuinely overlays the page.

The header additionally uses a frosted treatment: an 88% background mix with `backdrop-filter: saturate(180%) blur(12px)`, its bottom border transparent until scroll.

### Named Rules
**The Flat-At-Rest Rule.** A surface is a hairline and a tonal step. Shadow is a response — scroll, hover, or genuine overlay — and every hover lift is cancelled under `prefers-reduced-motion`.

## Shapes

Softly rounded, not pill-shaped. Four radii do all the work: 4px on the smallest controls (the inline search submit, the global focus ring), 6px as the default for buttons, inputs, nav items, selects, specs and alerts, 10px on the larger containers (product card, CMS tile, form panel, map frame, empty state), and a full pill on status badges alone. Colour swatches are perfect circles with a 1px `rgba(0,0,0,0.2)` ring so a white swatch still reads as an object.

Borders are the primary drawing tool: 1px hairline at rest, strong hairline on hover, red on focus. The one dashed border in the system marks an empty state. Product imagery sits in a square (1:1) media well with contained fit; CMS tiles use 4:3 at tablet and 16:10 on a phone. Motion is uniform: `cubic-bezier(0.16, 1, 0.3, 1)` at 120ms (micro), 200ms (default) or 340ms (drawer and disclosure), with a global reduced-motion clamp.

## Components

### Buttons
- **Shape:** Gently rounded (6px); the compact in-field submit is 4px.
- **Primary:** REED Red ground, white label, 600 weight at 0.875rem, 42px min height, 1.25rem side padding. The form submit is taller (44px) with 0.75rem/1.5rem padding. Hover deepens one step, press deepens two; disabled goes to the strong hairline grey with `not-allowed`.
- **Directional (GoButton):** A forward button places its arrow after the label and slides it +3px on hover; a back button reverses both. The arrow is inline SVG at 16px, stroked in `currentColor`.
- **Outline / ghost:** White ground, hairline border, ink label — the burger and the mobile filters toggle. Hover strengthens the border and drops to the subtle grey ground.
- **Tile button:** Inside CMS tiles only, a transparent 2px-outlined button in light (or ink, when the tile is dark) that inverts to a solid fill on tile hover.

### Chips
- **Style:** Status pills are fully rounded, uppercase 0.6875rem at 700 with +0.03em, on a tinted ground with same-hue text. No border.
- **State:** Static markers, not interactive filters — new, sale, bestseller, coming soon, out of stock. They overlay the top of the product card's media well.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** White; an out-of-stock card drops to the subtle grey and dims its image to 55% at 0.4 saturation.
- **Shadow Strategy:** Flat at rest; Lift plus a −2px translate on hover (see Elevation).
- **Border:** 1px hairline, strengthening on hover, turning red on focus-within.
- **Internal Padding:** 0.75rem on a phone, 1rem from 560px up. Media well is 1:1 with contained, multiplied product imagery; body carries the name and code; the footer pins to the bottom with colour swatches above the price.

### Inputs / Fields
- **Style:** White ground, 1px hairline, 6px radius, 0.75rem padding, 0.875rem text. Labels sit above at 600 weight; a required field is marked with a red asterisk.
- **Focus:** Border turns REED Red with a 3px translucent red halo (`color-mix(…, 16%)`). The global `:focus-visible` ring is a 2px red outline at 2px offset.
- **Error / Disabled:** An invalid field takes the red border plus the brand wash ground, with red-active error text below at 0.8125rem; a form-level error is a wash-filled 6px block. The submit disables until consent is checked and explains itself in a subtle-ink hint.
- **Search:** A single bordered shell holding a subtle-ink magnifier, a borderless 38px input, and a compact red submit inside the right edge; the shell owns the hover and focus-within treatment.

### Navigation
- **Desktop nav:** 0.875rem at 600, muted ink, 6px radius. Hover darkens to ink over subtle grey. The active item goes red and grows a 2px red underline inset to its padding box.
- **Category rail:** A recursive list; nested levels indent behind a 1px hairline rail rather than a heavy border. Top level is ink at 600/1rem; an ancestor of the current page goes ink and 600; the exact current page goes red on brand wash.
- **Mobile:** Below 900px the nav collapses into a bordered burger that toggles a full-width drawer beneath the header — search first, then a stack of 600-weight links divided by hairlines, the active one in red. The drawer animates open on a `grid-template-rows: 0fr → 1fr` transition over 340ms behind a 42%-ink scrim, closes on Escape or route change, and locks body scroll while open. The category rail uses the same disclosure pattern behind a "filters" toggle.
- **Pagination:** 36px square number buttons, transparent-bordered and muted at rest, subtle-grey on hover; the current page takes a red border, brand wash and red text. Gaps render as an ellipsis; the page window is ±1 on a phone and ±2 from 640px.

### Colour Swatch
The system's one genuinely custom primitive: a 20px circle with a hairline ring, showing a single fill, a diagonally split two-colour fill (the second colour is a 45°-rotated half overlay), a multicolour asset, or a "?" at 50% opacity when the colour is unknown. Cards show up to six and count the rest as "+N". Hover raises a tooltip carrying the colour name and its availability; on a card the tooltips are rendered outside the card because the card's hover transform would break their positioning.

### Browser Surfaces
Selection is brand-100 ground with brand-900 text; caret and `accent-color` are REED Red; scrollbars are themed in both the WebKit pseudo-element form (12px, 3px-inset pill thumb on the subtle track) and the standard `scrollbar-color` form behind an `@supports` split.

## Do's and Don'ts

### Do:
- **Do** spend red only on action, current state, focus, required marks, errors and sale — the Reserved Red Rule is the system's central constraint.
- **Do** use Stock Green (`#14652a`) for availability and for the inquiry-sent confirmation, so confirmation never reads as discount.
- **Do** draw separation with a 1px hairline (`#dde0e7`) and a tonal step first; add shadow only for scroll, hover or a genuine overlay.
- **Do** ship new status colours as a measured tinted-ground/same-hue-foreground pair at ≥6:1, and keep subtle ink no lighter than `#666d7d`.
- **Do** size every gap on the 4px scale and every radius from 4/6/10/pill; no in-between values.
- **Do** state responsive behaviour explicitly at 560 / 640 / 720 / 900 / 1100px, and offset sticky elements from `--header-h`, never from a literal pixel height.
- **Do** keep the catalog at two columns on the narrowest phone and let auto-fill take over from a 210px (560px+) or 200px (900px+) floor.
- **Do** scale text inside a CMS tile with container query units, because a tile's width is authored per-tile and unrelated to the viewport.
- **Do** give numbers that share a column tabular figures, and set product and supplier codes in the mono stack.
- **Do** end every product surface with the inquiry, and let it own the only primary button on the page.

### Don't:
- **Don't** fill a surface, heading, divider or decorative panel with REED Red, and don't introduce a second accent hue beside it.
- **Don't** design any cart, checkout, price-total, quantity-stepper or order-status affordance; inquiry is the business model, not a stopgap.
- **Don't** imply social proof — no testimonial cards, client logo strips, case-study tiles, star ratings or counter statistics, and no placeholder shapes that read as any of those. None of that evidence exists.
- **Don't** add a third type family, and don't fake weights: the Archivo variable axis and the mono stack are the whole system.
- **Don't** write a kicker, eyebrow or decorative label line above a heading. The uppercase label role is for functional captions ("7 KOLORÓW") and status pills only.
- **Don't** use hard offset shadows, glyph or emoji icons, or a system display face; icons are inline stroked SVG at 16–22px in `currentColor`.
- **Don't** hardcode a colour, radius, duration or gap in a component when a token exists, and don't reach for the legacy `--main` / `--white` / `--light` aliases in new work — they exist only to keep old shared components alive.
- **Don't** hardcode homepage composition: the CMS block system (title / tiles / category / whitespace) must keep working, and a tile's authored 4-column placement must survive untouched from 900px up.
- **Don't** replace the REED logo, recolour it, or set it in type.
- **Don't** let a hover transform ship without a `prefers-reduced-motion` cancellation.
