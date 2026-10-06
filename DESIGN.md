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

Two contextual facts belong in the record. First: the previous site carried exactly one `@media` rule in its entire source tree and had no mobile layout at all, which is why this system states its responsive rules explicitly and at named breakpoints rather than leaving them to be inferred. Second: the admin panel at `/admin` is a separate system with its own `ui-admin.css`, recorded below under **Design System: REED Kalisz — Admin Panel**; nothing in this website system applies to it.

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

---

# Design System: REED Kalisz — Admin Panel

<!-- A second, separate system in this file. The YAML frontmatter at the top belongs to the public website; the admin's
     tokens are the block below (normative for /admin), mirrored in .impeccable/design-admin.json. Source of truth:
     frontend/src/lib/shared/styles/ui-admin.css. -->

```yaml
name: REED Kalisz — Admin Panel
description: REED's own carbonless job ticket — plies of a self-copying form printed in one navy ink on a soft backing board.
colors:
  navy-ink: "#1b2f4e"          # --navy-700
  navy-ink-hover: "#2c4268"    # --navy-600
  navy-ink-pressed: "#0e1b2f"  # --navy-900
  navy-deep: "#08111e"         # --navy-950
  navy-pointer: "#526a8e"      # --navy-500
  copy-blue: "#eff3f9"         # --navy-50
  selected-blue: "#d2dbe9"     # --navy-100
  rail: "#13213a"
  board: "#dde2e9"
  paper: "#f8f9fb"
  paper-field: "#ffffff"
  ply-yellow: "#f5eed3"
  text: "#131f33"
  grey-hover: "#eef1f6"        # --grey-50
  grey-head: "#e5e9f0"         # --grey-100
  grey-muted: "#737f91"        # --grey-500
  serial-red: "#bf0417"        # --red-500
  info-blue: "#e6eef8"         # --blue-100
  link-blue: "#2f5d9e"         # --blue-700
  success-green: "#cdeccf"     # --green-100
  warning-orange: "#fddcb9"    # --orange-100
  new-purple: "#e9dcfb"        # --purple-100
  danger-red: "#efc5ca"        # --red-100
typography:
  page-title:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  section-head:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "-0.005em"
  editor-title:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  box-head:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: "1.25rem"
  body:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
  caption:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  grid-head:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
  serial:
    fontFamily: "'Bricolage Admin', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: "tnum"
rounded:                       # all drawn as squircles (corner-shape: squircle)
  compact: "0.4rem"            # --field-radius-compact
  field-small: "0.5rem"        # --field-radius-small
  small: "0.6rem"              # --border-radius
  button-small: "0.6rem"       # --button-radius-small
  field: "0.65rem"             # --field-radius
  button: "0.75rem"            # --button-radius
  box: "1rem"                  # --box-radius
spacing:
  row-pad: "calc((1.75rem - 1px - 1.5rem) / 2)"  # --row-pad: a ledger row one cell with its rule (1.5px)
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  section: "0.875rem"          # half a cell (--half), between sections
  page-pad: "0.875rem"         # --page-pad: half a cell (--cell 1.75rem, 28px)
components:
  button-primary:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.paper-field}"
    rounded: "{rounded.button}"
    height: "2.1875rem"        # --control: 1.25 cells, 35px
    padding: "0 1rem"
  button-primary-hover:
    backgroundColor: "{colors.navy-ink-hover}"
  button-primary-active:
    backgroundColor: "{colors.navy-ink-pressed}"
  button-secondary:
    backgroundColor: "{colors.grey-head}"
    textColor: "{colors.text}"
    rounded: "{rounded.button}"
    height: "2.1875rem"        # --control
  button-selected:
    backgroundColor: "{colors.selected-blue}"
    textColor: "{colors.text}"
    rounded: "{rounded.button}"
  bar-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.small}"
    height: "2.1875rem"        # --bar-button = --control
    padding: "0 1rem"
  bar-button-active:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.paper-field}"
  input:
    backgroundColor: "{colors.paper-field}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    height: "2.1875rem"        # --control
    padding: "0.25rem 0.5rem"
  box:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.box}"
    padding: "calc(0.875rem - 1px) calc(0.875rem - 1px) calc(0.875rem - 2px)"  # --box-pad: half a cell less its border (13px), the bottom a pixel less on the mat
  box-element:
    backgroundColor: "{colors.copy-blue}"
  box-optional:
    backgroundColor: "{colors.ply-yellow}"
  box-uneditable:
    backgroundColor: "{colors.grey-head}"
  grid-head:
    backgroundColor: "{colors.paper}"
    typography: "{typography.grid-head}"
  pagination-active:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.paper-field}"
    rounded: "{rounded.small}"
    width: "2.5rem"
    height: "2.1875rem"        # --control
  nav-current:
    backgroundColor: "{colors.board}"
    textColor: "{colors.text}"
    height: "2.625rem"         # 1½ cells, 42px
```

## Overview

**Creative North Star: "The Carbonless Job Ticket"**

The admin is REED's own self-copying job ticket, the kind a print shop fills in all day. Every box, bar, table and popup is a ply of that form, lying on a soft blue-grey backing board marked out as a modelling cutting mat; every rule, caption and button is printed in one navy ink; the form carries a red serial number. It refuses the SaaS card admin of floating rounded tiles on a dotted ground; its own corners are squircles, which read crisper than round corners of the same radius.

This is a restyle of a tool staff already know, so the layout and the flow are the incumbent ones: no button, title or action moved. The world lives in the finish: the ground is soft (board and off-white plies, never pure white on grey), a dark rail frames a light workspace, and density is balanced — tables are tight ledgers (one cell to a row, its rule on a mat line) but nothing is shrunk past easy reading for a full working day.

The navy family is the admin's colour by the owner's decision. Colour beyond it is functional only: a small set of status families (info blue, success green, warning orange, new purple, danger red) each used in a 100 / 200 / 300 ramp for rest / hover / pressed.

**Key Characteristics:**
- A pad of plies (#f8f9fb paper) on a backing board (#dde2e9) marked as a faint cutting mat: 1.75rem cells, every line one strength, inside a frame stopping half a cell (0.875rem) short of the edges, a ruler's ticks along the frame (every quarter cell, four to a square, longer at each line, longest at every fifth); it scrolls with what lies on it, as a real board would, and the top bars' content is centred in the two cells under the frame
- One navy ink (#1b2f4e) for buttons, rules and captions; navy-alpha for every line, so lines darken with the ply they sit on
- Copy plies: copy-blue for repeated elements, yellow for optional ones, grey for what can't be edited
- A dark navy rail torn off along a perforated edge; the current page is a board-coloured tab with a red icon
- REED red prints the serial: the version number in the rail and the item code in the editor bar
- Squircle corners everywhere (0.4–1rem), flat plies with a thin edge shadow, a lifted shadow only for sheets laid over the page

## Colors

A one-ink palette: navy does all structural work on a soft cool ground, red is reserved for the serial and for danger, and the status hues stay pale tints.

### Primary
- **Navy Ink** (`navy-ink`): The one ink. Primary buttons, the active bar button and page number, checkbox fill, focus outlines, caret and accent colour. Hover steps lighter (`navy-ink-hover`), pressed steps darker (`navy-ink-pressed`); under-the-pointer edges use `navy-pointer`.
- **Deep Navy** (`navy-deep`): Headings (page title, editor title, box heads, simple tables' heads) and dark icons.
- **Copy Blue** (`copy-blue`): The copy ply. A box repeated for each of a kind (a variant, a calculation).
- **Selected Blue** (`selected-blue`): A picked button, a selected row, drop slots; also the text-selection highlight family.

### Secondary
- **Serial Red** (`serial-red`): REED's red, printed only as the form's serial — the item code after the editor title, the version number at the foot of the rail (there at 55% of a pink tint of it, full on hover) — the current page's icon in the rail, field errors, the red top or full edge of a danger / error modal, and the hover of a dangerous button.

### Tertiary
- **Status tints** (`info-blue`, `success-green`, `warning-orange`, `new-purple`, `danger-red`, each with 200 / 300 steps in ui-admin.css): Tone buttons and row states. Never text colours, never large surfaces.
- **Link Blue** (`link-blue`): Text links inside a box, lightening to `#5b88c7` under the pointer.

### Neutral
- **Backing Board** (`board`): The page under everything, the editor sheet, the current-page tab in the rail; carries the cutting mat.
- **Paper** (`paper`): Every ply — box, bar, table, popup, pagination strip.
- **Field White** (`paper-field`): A field written on a ply, a shade brighter than it; table rows in ruled tables.
- **Yellow Ply** (`ply-yellow`): The yellow copy — an optional box.
- **Rail** (`rail`): The menu, a deeper print of the ink; its internal rules are white at 8%.
- **Text** (`text`): Ink at full strength for body copy.
- **Greys** (`grey-hover`, `grey-head`, `grey-muted`): row hover; price-table heads, secondary buttons, uneditable boxes, disabled fills; muted text and dashed outlines.
- **Navy alpha lines**: borders `rgb(27 47 78 / 0.12)`, a field's edge 0.26 with its bottom writing line 0.42, ink table lines 0.5, a ledger's head rule 0.3 and row ruling 0.075 (`--ledger-rule`), the cutting mat's cells, frame and ruler ticks all 0.06 (`--mat-line`), captions 0.9 / 0.7. The "black" overlays are navy too (backdrops 0.22 for an editor, 0.48 for a popup).

### Named Rules
**The One Ink Rule.** Every line, caption and button on the form is printed in the navy ink or that ink seen through (alpha). There is no black and no neutral grey line; a colour not in ui-admin.css is one of its families.

**The Serial Rule.** Red marks what identifies the form (the item code, the version, the page you're on) and what destroys data. It is never a fill for a surface, heading or rule.

**The Soft Ground Rule.** The workspace is board and off-white plies, never pure white on grey; pure white is reserved for a field written on a ply.

## Typography

**Display Font:** Bricolage Grotesque, loaded as `'Bricolage Admin'` (variable 300–800, `font-display: swap`, `size-adjust: 94%`) with `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`
**Body Font:** the same face
**Label/Mono Font:** none; `monospace` only in raw JSON text areas

**Character:** One grotesque with a printed, slightly quirky character carries everything; hierarchy comes from weight, size and the uppercase caption, not from a second family.

### Hierarchy
- **Page title** (700, 2rem, -0.01em; 1.4rem on a phone): the header's h1, in deep navy.
- **Section head** (700, 1rem, -0.005em, sentence case, full ink): a section of the form (Opis, Cennik, Warianty) on a small paper label lying on the mat like a box - a cell tall less 1px, whole half cells wide (onGrid), the name centred, its top on a mat line; no rule, the mat's lines do the separating. In a split section (Cennik | Kalkulacje) each column has its own. The page title's icon is centred on the mat line between the first two cells.
- **Editor title** (700, 1.5rem; 1.2rem on a phone): the item name in the editor bar, followed by the serial.
- **Box head** (700, 1.1rem on a 1.25rem line): a head inside a box; with the box's gap under it, its row is ¾ cell as a field label's is.
- **Body / control** (400–500, 0.95rem; 0.85rem small): field values, button labels (500), bar buttons (700 label).
- **Caption** (700, 0.7rem, 0.05em, uppercase): field labels, each on a row ¾ cell tall (21px, the name over 0.25rem), so label and field make two cells; its note after a middle dot at 600 in muted ink. Stat labels in bars are 0.65rem / 0.04em.
- **Grid head** (600, 0.8rem, sentence case, full ink): a ledger's column heads, on the rows' paper.
- **Serial** (600, 1rem, 0.04em, tabular figures): the red item code.

### Named Rules
**The Printed Caption Rule.** Every field label is the same caption: small, bold, uppercase, tracked 0.05em, navy at 90%; bar stats take its smaller sibling. It is a functional caption only, never a decorative line above a heading, and ledger heads are not set in it.

**The Tabular Number Rule.** Counts, page numbers, serials and versions use tabular figures.

## Layout

**The grid.** Everything is laid out on the cutting mat's cells: `--cell` 1.75rem (28px, whole pixels at every step), `--half` 14px, `--quarter` 7px as the smallest unit. What lies on the mat (a box, a bar, a table, the category tree, a section label) fills a slot of whole half cells and sits 1px inside it (`.ui-on-mat`, the class Grid's table carries; boxes, bars and `.ui-snap` parts get the same 1px), so the mat's line before it always shows and none runs under its edge. Boxes pad ½ cell less their 1px border (`--box-pad`, 13px; the bottom a pixel less, so content in whole half cells makes a box exactly its slot) and are whole half cells tall (onGrid rounds the rest up in one batched pass, content from the top); inside, a field label's row is ¾ cell (21px), so label and field are two cells, a box head takes a ¾-cell row the same way, and a checkbox row is one cell; gaps are half a cell (`--page-pad`, 0.875rem); controls are 1¼ cells (`--control`, 35px); bars and pagination two cells. Bars, the pagination and the products' category tree pad `--bar-pad` top and bottom and `--box-pad` at the sides, so what's in them starts 14px in (border included), as a box's content does; a table pads its cells the same way at the sides (`--cell-pad` = `--box-pad`). The page's content width (and a list page's height) is rounded down to whole half cells in CSS (`mod()` / `round()`): the leftover (`--leftover`, `--fill-height`) goes outside the mat's right and bottom frame, so what lies on the mat reaches its frame; the same leftover pads the right end of the header and the editor bar and cuts their copy of the mat, so their right edges and their mat line up with the page's. On a phone the leftover is split on both sides (`--lead` before the mat, the rest after it), and the header's and editor bar's content starts where the boxes start. Editor columns are `round()`ed to half cells, the last taking the remainder. All of the mat's lines - cells, frame, ruler ticks (every quarter cell, longer at each cell line, longest at every fifth) - share one strength (`--mat-line`, 0.06).

The incumbent layout, unchanged by the restyle: a fixed rail on the left (`--nav-width` 9rem), a fixed header (`--header-height` = the mat's frame plus two cells, 70px; frame plus 1½ cells on a phone), content padded half a cell (0.875rem, `--mat-margin`, the same half cell as `--page-pad`) to the mat's frame. The header's and editor bar's content is centred in the two cells under the frame (its middle on a mat line) (buttons 1¼ cells tall, `--bar-button` = `--control`, 35px; the rows a pixel shorter than the two cells, so the buttons lie on whole pixels), and the first box starts on the next line; the header's tabs start on half lines (1px past one, as what lies on the mat), each widened to reach the next, measured since their labels are as wide as their text; the rail logo and the editor's icon disc are as tall; titles, icons, the serial and the rail logo are centred on the buttons (type is centred first, gridded second): titles are trimmed to cap/alphabetic with `text-box` so their capitals are what centres, and the ellipsizing editor title gets 0.3em of symmetric block padding so its clip doesn't cut accents or tails. Page edges sit on the cutting mat's frame; page-level gaps (bar to table, table to pagination, tree to table) are half a cell, 0.875rem (`--page-pad`); a single-row bar and the pagination are exactly two cells (3.5rem), and a taller bar (filters wrapping, the API's double bar) is rounded up to whole half cells by the `onGrid` action on the page content, its rows centred (the API's double bar is built to exactly two cells while loading, only the companies' bar showing, and three and a half once loaded: the companies' bar two cells, the sorting bar 1½ under it; the mapping tabs are joined the same way, the companies' bar two cells, a line, then the mapping's own bar 1½ cells - Anuluj/Zapisz sliding in once something changed, the done / total counts, the title and its note - rounded up to whole half cells when it wraps; it sticks under the header, its top line fading in as it does, and the hints lie in a box under it); the products' category tree is 23 half cells less 1px (321px) so, with the gap, the table starts on a line. Only content-driven heights fall between lines. List pages fill the window height and scroll only their table, keeping the bar above and pagination below in view. Under the content lies the cutting mat (the `Mat` component), beside the rail, as tall as the window or the page, and it scrolls with the page like a real board. Editors slide in as a sheet 80vw wide from the right (full width on a phone) over a navy backdrop, with a sticky bar as tall as the header; the sheet carries its own `Mat`, reaching up under the bar and scrolling with the sheet's content. File-list modals (the picker, unused files, the API image review) lie on the mat too (Modal's `mat` prop): board-coloured with their own scrolling `Mat`, content on its frame; the sheet is whole half cells wide (the leftover past the frame) and its min-height rounded to whole half cells, with `onGrid` on the sheet. One without a bar (the picker) starts its first box on the mat's first cell; in one with a bar its title and buttons lie on a paper `.ui-bar` on the mat's first two cells, frosted round like the header, and the body starts half a cell under it. Their groups (the picker's sections, unused files' kinds, the image review's products) have paper section labels (`.ui-h2`) on cell lines - an imported product's open button, a small square, left of its label - and their tile grids are snapped (`.ui-snap`); file-tile labels sit on board-coloured backings so they read over the mat's lines. Signed out, the window is a cutting mat of its own (whole half cells both ways, the leftover past its right and bottom frame) and the login is a paper box lying on it: 1px inside its slot, snapped by `onGrid`, 22 half cells wide (or the mat's width), centred across and on a cell line a little above the middle, with the plain ply shadow; when a session ends over an open page it is a lifted popup over the dimmed page instead.

Editor sections lay out on a grid of at most three columns (each at least 21.875rem, boxes half a cell apart: 0.875rem, as file and image tiles), one column on a phone; sections are at least half a cell apart (0.875rem), and each section label is pushed further (0 to one cell, by the `onGrid` action in the editor, re-run whenever the content changes) so its top lies on a line of the mat (no rule); fields in a box half a cell apart, paired fields side by side at 1rem. A product's gallery and attachment tiles lie in columns of whole half cells, as many as fit at `--tile` (9 half cells, 126px; three at least on a phone), the last taking the rest, half a cell apart; a lone "+ Dodaj" is one tile wide (no wider than a third of the section), 1px inside a 1½-cell slot, and beside a box it turns on its side. Library tiles (`.ui-tiles`: the library, unused files, the image review) fill a grid of 7.8125rem minimum (5.9375rem on a phone). The single breakpoint is 50rem: below it the rail becomes an off-canvas drawer opened from a square button in the bottom-left corner, and header and editor bars collapse into one sideways-scrolling line.

Density: ledger rows are one cell each with their rule (`--row-pad` (cell − 1px − 1.5rem) / 2 = 1.5px around a 1.5rem line), the head a pixel less, the last row two less, a wrapping row's lines a cell apart, with a 0.4rem column gap, so every rule lies on a mat line; controls are 35px high (`--control`, 1¼ cells; 1.5rem small, 1.2rem compact); a bar is never lower than two cells. Lists show 50 rows a page by default (API products and the file picker too; unused files 100).

## Elevation & Depth

Depth is the stack of a paper pad: plies lie flat on the board's cutting mat with a thin edge, and only a sheet laid over the page (an editor, a modal, a dragged tile, the phone's menu button, the login when a session ends over a page) lifts. A ply nested inside another ply lies flat on it (no shadow). Top bars are solid board at rest and turn to a see-through frost (60% board, 0.75rem blur, over the first 24px scrolled) as content scrolls under them, a perforation line coming in at their bottom edge; the mat's top stays crisp on them (`<Mat bar />`: a copy clipped to the bar, lined up with the mat, always shown). The mat paints only inside its frame (the frame drawn as an outline, the margin left unpainted but for the ruler's ticks), so a bar's frost shows past the ruler.

### Shadow Vocabulary
- **Ply edge** (`box-shadow: 0 1px 0 rgb(14 27 47 / 0.05), 0 1px 3px rgb(14 27 47 / 0.06)`): every box, bar, grid and pagination strip at rest.
- **Lifted sheet** (`box-shadow: 0 2px 6px rgb(14 27 47 / 0.08), 0 12px 32px rgb(14 27 47 / 0.16)`): editor sheet, modal panel, dragged tile, phone menu button.
- **Focus halo** (`box-shadow: 0 0 0 3px rgb(27 47 78 / 0.12)`): a focused input or select, with its border turning navy ink.

### Named Rules
**The Flat Ply Rule.** At rest a surface gets the ply edge or nothing. No glows, no hover lifts, no offset shadows; lifting is reserved for something laid over the page.

**The Perforation Rule.** Where a part tears off the form, it is drawn as a row of navy-alpha holes: under the header and editor bar once content scrolls beneath them, and down the rail's right edge (board-coloured holes).

## Shapes

Corners are squircles (`corner-shape: squircle`, falling back to a plain round where unsupported): boxes, bars, tables, popups, fields, buttons, chips, tiles, the rail's current-page tab, and the pagination strip's end cells (the REED logo in the rail is square, as its file is). A squircle reads sharper than a round corner of the same radius, so the radii run larger than they look: small things (tags, chips, tiles, section labels, bar buttons, pagination ends) 0.6rem; fields 0.65rem; buttons 0.75rem; boxes, bars, tables, popups and large buttons 1rem; small and compact fields 0.5rem and 0.4rem, small buttons 0.6rem. Full rounds exist only for true circles (avatar, colour swatches, the editor's icon disc) and for status pills (NOWE, margin values, counts). Lines are 1px; a field has a darker bottom edge, the line it is written on. Dashed 1px grey outlines mark an empty slot to add into ("+ Dodaj").

## Components

### Buttons
Printed in the ink, quiet and exact.
- **Shape:** squircle (0.75rem; 0.6rem small; 1rem large), 1¼ cells high (`--control`, 35px, everywhere, a phone too; 1.5rem small; large grows from 3.5rem).
- **Primary:** navy ink fill, white 0.95rem / 500 label, 0 1rem padding; hover one step lighter, pressed one step darker, 120ms colour transition. Focus: 2px navy outline offset 2px.
- **Dangerous:** navy at rest, red on hover and press.
- **Secondary / Outline / Ghost / Dashed:** grey-head fill; field-white with an inset navy-alpha edge; transparent with a navy wash; transparent with a dashed grey outline that turns navy on hover.
- **Tones:** info, selected, success, warning, danger, new, and a diagonal orange/purple split, each its family's 100 / 200 / 300; and note, the optional boxes' ply yellow deepening to yellow-100 when pressed (left as it is by choice, not wrong - an ignored category or labeling gets a yellow-500 X).
- **Disabled:** grey-head fill, muted label, not-allowed cursor.

### Bar Buttons
The header's and editor bar's buttons: paper at 60% so the frosted board shows through, a 1.5px navy-ink border, 0.6rem squircle corners, 35px high (`--bar-button` = `--control`, 1¼ cells), 700 label. Active is a navy-ink fill with a white label; dangerous takes a red border and label; hover fills with a per-button tint (blue, red for cancel, green for save).

### Cards / Containers (boxes)
- **Corner Style:** squircle, 1rem.
- **Background:** paper; copy-blue for a repeated element, yellow for an optional box, grey-head for uneditable.
- **Shadow Strategy:** ply edge; none when nested.
- **Border:** 1px navy at 12%.
- **Internal Padding:** half a cell less the border (`--box-pad`, 13px; the bottom a pixel less on the mat, so simple content makes the box exactly its slot), a half-cell gap; an optional box inside another reaches a quarter cell (7px) into its padding, padded a quarter cell itself, so fields line up.

### Inputs / Fields
- **Style:** field-white, 1px navy at 26% with a 42% bottom writing line, 0.65rem squircle corners, 1¼ cells high (`--control`, 35px), 0.95rem text, placeholder navy at 40%. Select matches.
- **Focus:** border to navy ink plus the 3px navy-alpha halo; hover border to `navy-pointer`.
- **Error / Disabled:** 2px red outline with a red message; disabled at 60% opacity. Checkboxes are 1.25rem squares filling navy ink with a white tick; a checkbox row in a box is one cell.
- **Label:** the printed caption above, on a ¾-cell row (21px, the name over 0.25rem), so label and field are two cells.

### Grid (ledger tables)
A ruled ledger on a paper ply (`.ui-on-mat`): a sticky head on the rows' own paper, sentence case at 0.8rem / 600 in full ink, ruled off by a 1px navy line at 30%; rows ruled at 7.5% navy, each one cell with its rule (1.5px padding round a 1.5rem line), the head a pixel less and the last row two less, so every rule lies on a mat line and the table's slot is whole cells (snapped by `onGrid` off list pages), a wrapping row's lines a cell apart, columns 0.4rem apart, the cells padded `--cell-pad` (= `--box-pad`) at the sides so the first and last columns' content is as far in as a box's (the empty-table text too); hover grey-hover, selected selected-blue, warning orange-100. Simple tables (`ui-table`, the price tables) keep a grey-head header, field-white rows, 2rem cells and 1px lines (navy 12%, or 50% for the dark variant).

### Pagination
A paper strip padded as a bar (two cells tall, a box's padding at the sides) with a joined row of cells: 2.5rem × `--control` (35px) field-white cells (arrows 3rem) overlapping by 1px, squircle corners only at the run's ends; the current page is navy ink with white tabular figures.

### Navigation (rail)
The form's stub: rail navy, the REED logo at the top (square, as its file is), buttons 1½ cells (42px) one under another with no gap, groups half a cell apart with a white 8% rule halfway down the gap, 1.3rem icons and 0.95rem white labels, a 7% white wash on hover with no animation. The current page is a squircled tab of the board reaching through the rail's right padding and perforation, dark label, red icon. At the foot: the user's name in a darker band, which takes up what the window's height leaves over the half cells so Wyloguj above it starts on a half line, and the red version number as the form's serial, opening the changelog. On a short window the menu scrolls; on a phone it becomes a drawer over a 48% navy backdrop.

### Header and Editor Bar
Top bars with the deep-navy title. The header carries the page icon, title, tabs and bar buttons; the editor bar the item's icon in a paper disc, its name, the red serial after it, and the save / cancel / delete bar buttons. Both are solid board at rest, turning to a see-through frost (60% board, 0.75rem blur) with a perforation line coming in as content scrolls under them. Their rows are a pixel shorter than the two cells, so the 35px buttons lie on whole pixels; the header's tabs start on half lines, each widened to reach the next. On a phone their content starts where the boxes start.

### Section Head
A section's name (1rem) on a small paper label (`.ui-h2 > span`): a cell tall less 1px, whole half cells wide (onGrid), 0.6rem squircle, paper with the ply edge and shadow, its top pushed onto a mat line. No rule; the mat's lines do the separating.

### Modal
A paper panel (1rem squircle, lifted) on a 48% navy backdrop, 1.5rem side padding, a sticky bar that frosts as content scrolls, actions bottom-right; a danger modal has a 3px red top edge, an error one a 3px red frame. A mat variant (the `mat` prop: the file picker, unused files, the image review) is board-coloured with its own scrolling cutting mat and half-cell side padding, its sheet whole half cells (the leftover past the frame, its min-height rounded) and kept on the cells by `onGrid`: without a bar its first box starts on the mat's first cell; with one, the title and buttons lie on a paper `.ui-bar` on the mat's first cells, frosted round like the header, and the body starts half a cell under it. Its groups have paper section labels on cell lines over snapped tile grids.

## Do's and Don'ts

### Do:
- **Do** take every colour, radius and shadow from ui-admin.css; a colour that isn't there is one of its families.
- **Do** draw lines in navy alpha (borders 0.12, field edges 0.26 / 0.42) so they darken with the ply they sit on.
- **Do** put repeated elements on copy-blue, optional ones on yellow and uneditable ones on grey, and lay a nested ply flat.
- **Do** label fields with the printed caption (0.7rem, 700, uppercase, 0.05em), and head ledger columns in sentence case (0.8rem, 600, full ink) on the rows' paper.
- **Do** draw corners as squircles at the radius tokens (0.4–1rem).
- **Do** give coloured buttons their family's 100 / 200 / 300 for rest / hover / pressed.
- **Do** keep the layout and flow when restyling: buttons, titles and actions stay where staff know them.

### Don't:
- **Don't** use pure white as a page or box ground; white is for a field written on a ply.
- **Don't** set fully round corners on boxes, buttons or fields; full rounds are for circles and status pills only.
- **Don't** fill surfaces, headings or rules with REED red; it prints the serial, the current page's icon and danger.
- **Don't** add glows, hover lifts or offset shadows; at rest a ply has its thin edge or nothing.
- **Don't** introduce a second type family; Bricolage Grotesque is the whole system.
- **Don't** write a kicker or eyebrow above a heading; the uppercase caption is for field labels and bar stats only.
