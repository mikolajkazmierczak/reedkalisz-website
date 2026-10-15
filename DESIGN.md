---
name: REED Kalisz — Public Website
description: A printer's poster, not a catalog template — one paper sheet edge to edge, flat navy fields, 2px ink rules instead of shadows, red for action and orange for contact.
colors:
  reed-red: "#bf0417"
  reed-red-hover: "#a20313"
  reed-red-deep: "#8c020f"
  reed-red-tint: "#fbeff0"
  navy: "#1b2f4e"
  navy-text: "#cfdcee"
  navy-text-muted: "#a9bcd6"
  contact-orange: "#f36e2f"
  contact-orange-small: "#ff7637"
  contact-orange-light: "#ff8e59"
  contact-orange-large: "#f4661d"
  contact-orange-deep: "#bc4a0b"
  badge-purple: "#5b2a86"
  badge-green: "#166534"
  badge-blue: "#4f86d9"
  badge-blue-light: "#d9e7fb"
  paper: "#fdfdfc"
  paper-2: "#f4f3f0"
  paper-3: "#e9e7e2"
  paper-4: "#d8d5cf"
  surface: "#ffffff"
  ink: "#111110"
  ink-700: "#2e2d2b"
  ink-600: "#47443f"
  ink-500: "#55524d"
  ink-400: "#78746d"
  ink-300: "#a8a49c"
  border: "rgba(17, 17, 16, 0.14)"
  border-strong: "rgba(17, 17, 16, 0.26)"
typography:
  hero:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 1.2rem + 4.4vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "clamp(1.875rem, 1.35rem + 2.2vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  title:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "clamp(1.375rem, 1.15rem + 0.95vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body-small:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  price:
    fontFamily: "{typography.hero.fontFamily}"
    fontSize: "1.4375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.11em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.04em"
rounded:
  square: "0"
  card: "1.125rem"
  field: "1.5rem"
  banner: "clamp(1.5rem, 0.74rem + 3.24vw, 4rem)"
  pill: "62.4375rem"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  7: "1.75rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.6}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  button-ink-hover:
    backgroundColor: "{colors.ink-700}"
  button-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.6}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  button-light-hover:
    backgroundColor: "{colors.paper-2}"
  button-orange:
    backgroundColor: "{colors.contact-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.6}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  button-orange-hover:
    backgroundColor: "{colors.contact-orange-light}"
    textColor: "{colors.ink}"
  button-ghost-orange:
    textColor: "{colors.contact-orange-small}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.6}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  button-ghost-orange-hover:
    backgroundColor: "{colors.contact-orange}"
    textColor: "{colors.ink}"
  button-ghost-light:
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.6}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  button-ghost-light-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  button-tel:
    textColor: "{colors.contact-orange-deep}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.4}"
    height: "2.25rem"
    typography: "{typography.body-small}"
  button-tel-hover:
    backgroundColor: "{colors.contact-orange}"
    textColor: "{colors.ink}"
  button-disabled:
    backgroundColor: "{colors.paper-4}"
    textColor: "{colors.ink-400}"
  button-go:
    backgroundColor: "{colors.reed-red}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.5}"
    height: "2.625rem"
    typography: "{typography.body-small}"
  button-go-hover:
    backgroundColor: "{colors.reed-red-hover}"
  button-go-active:
    backgroundColor: "{colors.reed-red-deep}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "{spacing.3} {spacing.4}"
    height: "2.75rem"
    typography: "{typography.body-small}"
  input-textarea:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "{spacing.3} {spacing.4}"
    typography: "{typography.body-small}"
  input-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 2rem 0 {spacing.4}"
    height: "2.5rem"
    typography: "{typography.body-small}"
  hero-band:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    padding: "{spacing.12} 0"
    typography: "{typography.hero}"
  navy-band:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.navy-text}"
    padding: "{spacing.8} 0"
  ask-band:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "{spacing.12} 0"
    typography: "{typography.headline}"
  catalogue-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.4}"
    typography: "{typography.subtitle}"
  catalogue-cell-hover:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.reed-red}"
  product-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.4}"
  product-card-out:
    backgroundColor: "{colors.paper-2}"
  inquiry-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.5}"
  banner:
    rounded: "{rounded.banner}"
  badge-new:
    backgroundColor: "{colors.badge-purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-sale:
    backgroundColor: "{colors.reed-red}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-bestseller:
    backgroundColor: "{colors.badge-green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-soon:
    backgroundColor: "{colors.badge-blue-light}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-out:
    backgroundColor: "{colors.ink-600}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  badge-none:
    backgroundColor: "{colors.paper-3}"
    textColor: "{colors.ink-600}"
    rounded: "{rounded.pill}"
    padding: "0.1875rem {spacing.2}"
    typography: "{typography.label}"
  rail-contact:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.navy-text-muted}"
    padding: "{spacing.5} {spacing.5} {spacing.3}"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-300}"
    padding: "{spacing.12} 0 {spacing.10}"
---

# Design System: REED Kalisz — Public Website

## Overview

**Creative North Star: "The Printer's Poster"**

The public site is set like a poster from a print shop, not assembled from a catalog template. One paper sheet runs edge to edge with no mount, no floating cards on a grey page, no island gaps. Its structure comes from flat fields of navy (the hero, the Siedziba band, the SEO band, the rail's contact head, the /kontakt head) and from 2px ink rules wherever a softer system would reach for a shadow. Type does the shouting: Bricolage Grotesque at 800 for the hero, two-toned, with the second clause in orange on the navy.

Colour is assigned by job, not by taste. REED red means act, current, focus, sale and the logo tile. Navy means structure. Orange means contact, everywhere a visitor can write or call, and nothing else - except the hero, where it is "z Twoim logo": that clause, and the logo's place on everything the machine makes (owner's call, 2026-10-14). The product photography stays the only free colour on most screens.

Blocks are square and bounded by rules; controls are pills (squircled where the browser supports `corner-shape`). Inside the catalogue the arrangement is the familiar one: a left rail that is the whole navigation, a product grid, a product page that ends in an inquiry. The finish is a poster's: tight rules, real counts, nothing invented. The admin panel at `/admin` is a separate system with its own `ui-admin.css` (its look in `ui-admin-scope.css`, on `.ui-admin`, so the homepage's editor wears it too), recorded below under **Design System: REED Kalisz — Admin Panel**. Nothing in this website system applies to it: its look hangs on `.ui-admin` (the admin's `<html>`, and the homepage editor's panel on the website), and the website's global element and class rules stop at it (`:where(:not(.ui-admin *))`).

**Key Characteristics:**
- Paper ground (`paper`) edge to edge; warm ink ramp; white only for the surfaces that hold a product or a field
- Flat navy fields for structure; 2px ink rules for separation; no resting shadows
- Three working hues with fixed jobs: red = action/state, navy = structure, orange = contact
- Bricolage Grotesque (optical-size axis) for all text; the platform mono for codes, labels and badges
- Square blocks, pill controls, and one card radius for the inquiry panel; nothing in between
- A sticky 16.5rem rail on desktop; a slim bar with Zadzwoń and Menu pills on a phone
- The inquiry is the terminal action; no cart affordances exist anywhere

## Colors

A warm paper sheet and an ink ramp do the neutral work. Three hues each own exactly one meaning.

### Primary
- **REED Red** (`reed-red`): action, state, focus. It fills the directional "go" buttons, the ready search submit, the skip link and the product-page toast. It colours a hovered or current link, the current category and the selection highlight, and it supplies the focus ring, the caret and `accent-color`. It is also the sale badge and a sale card's edge, and the logo tile. Hover steps to `reed-red-hover`, press to `reed-red-deep`. `reed-red-tint` backs an invalid field and a form error, and nothing else.

### Secondary
- **Navy** (`navy`): structure. The hero field, the Siedziba band, the SEO band, the rail's contact head (logo, phone and email, Kontakt), the /kontakt page head and the menu overlay's head. Text on navy is white for headings, `navy-text` for ledes and lists, `navy-text-muted` for quieter lines. Links on navy stay white and underline; they never turn red on navy.
- **Contact Orange** (`contact-orange`): contact. Every /kontakt and phone control is orange: the rail and band "Napisz do nas" / Kontakt buttons, the phone bar's Zadzwoń pill, the closing ask's phone button, the error page's Kontakt and the empty-category ask. The question form takes it too, as its caret, checkbox and framed inquiry panel. One orange works everywhere, picked between the orange pens in the product photography and the hero's old bright clause (owner's call, 2026-10-14): it reads on navy (4.5:1) and on ink, the hero's emphasised clause included, and anything on it is ink (6.4:1; white would be 3:1). Orange text on paper or white, and the form's focus ring there, use `contact-orange-deep` (5:1), since the orange itself is 2.9:1 on paper. A filled orange button lightens to `contact-orange-light` on hover. Thin or small on navy or ink (the ghost button's outline and text, the map's dots and Kalisz, the hero drawing's logo marks) the orange reads darker than in the hero's big clause, so there it is `contact-orange-small`, a step lighter at the same hue and full chroma (5:1 on navy), to look the same. Small text there (the rail's and the footer's link hovers) reads darker still and takes `contact-orange-light`. Large orange text on paper or white (the inquiry panel's "Zapytanie", kept at 19px bold or more so it counts as large) takes `contact-orange-large`, as light as 3:1 allows.

### Tertiary
Product badges and card edges have their own fixed hues, each white-ringed so it reads on any photo: **Purple** (`badge-purple`) for Nowość, **Green** (`badge-green`) for Bestseller, **Blue Light** (`badge-blue-light`, navy text) for Wkrótce with **Blue** (`badge-blue`) as that card's edge and as the selected photo in the lightbox, ink-600 for out of stock, and a quiet paper-3 pill for Chwilowy brak. The sale badge is REED red.

### Neutral
- **Paper** (`paper`): the page ground, the rail, the catalogue cells, the closing ask band.
- **Paper 2 / 3 / 4** (`paper-2`, `paper-3`, `paper-4`): the catalogue map band and hover grounds; the price divider in a card and skeleton bones; the disabled button.
- **Surface** (`surface`): white, kept for what holds a product or an input: product cards, media wells, fields, selects, the inquiry panel.
- **Ink** (`ink`): text, every 2px rule, the ink button, the footer ground.
- **Ink 700 to 300**: ink-500 is muted prose (7.6:1 on paper). ink-400 is the darkest-tolerable subtle text (4.6:1 on paper), used for codes, "od", counts and units. ink-300 is control hairlines and footer small print.
- **Border / Border Strong** (`border`, `border-strong`): translucent ink hairlines inside a block (card edges, the catalogue's 1px cell gaps, map column heads).

### Named Rules
**The Three Jobs Rule.** Red is action and state, navy is structure, orange is contact. A colour never borrows another's job: no navy buttons, no red bands, no orange promotions.

**The Orange Means Contact Rule.** If a control writes to REED, calls REED or goes to /kontakt, it is orange, and nothing else is. Promotions are not contact: the sale badge is red.

**The Ink-On-Orange Rule.** Orange fills take ink text, never white. Orange reads as itself on navy and ink; as text on paper it is `contact-orange-deep`.

## Typography

**Display / Body Font:** Bricolage Grotesque from Google Fonts with `font-optical-sizing: auto`, falling back to `ui-sans-serif, system-ui`.
**Label / Mono Font:** the platform mono stack, used for product and supplier codes, the tracked `.label` caption and the product badges.

**Character:** a grotesque with some ink trap and swagger at display size, and calm at 13px in a card. Headings are 700 (the hero 800), tucked to −0.025em or tighter, `text-wrap: balance`. Body is 400 at 1.55, paragraphs `text-wrap: pretty`.

### Hierarchy
- **Hero** (800, fluid 2.25 to 4rem, 0.96, −0.035em): the homepage hero line alone, two-toned, max 16ch.
- **Headline** (700, fluid 1.875 to 3rem, 1.08): page titles and every homepage section head (Title blocks, Katalog, Siedziba, the closing ask). The hero size belongs only to the hero.
- **Title** (700, fluid 1.375 to 2rem): band heads (SEO), the catalogue map, CMS prose `h2`.
- **Subtitle** (700, fluid 1.0625 to 1.25rem): catalogue cell names, SEO block heads, footer column heads.
- **Body** (400, 1rem, 1.55): default. CMS prose runs 1.7 in ink-500, capped at 68ch. Ledes run fluid 1 to 1.125rem.
- **Body Small** (0.875rem): the working size of controls, nav, city lists and band copy. Buttons set it at 700.
- **Caption** (0.8125rem): counts, the footer's rights line, map leaves.
- **Price** (700, 1.4375rem, −0.02em, tabular): a card's price, stepping down via container queries in narrow cards so it never wraps.
- **Label** (mono 500, 0.6875rem, +0.11em, uppercase, ink-400): functional captions such as "Brak zdjęcia". Badges reuse the mono uppercase at 600/+0.08em.
- **Code** (mono, 0.8125rem, +0.04em, ink-400): product and supplier codes.

### Named Rules
**The One Voice Rule.** Bricolage carries every text role; mono exists for codes, functional captions and badges. No third family.

**The Hero Owns Its Size Rule.** `hero` appears once per site. Section heads stop at `headline`, so the hero stays the loudest thing on the sheet.

**The Tabular Number Rule.** Prices, counts and page numbers that sit in a row take tabular figures.

## Layout

The rail and the column. From 61.25rem a 16.5rem rail sits sticky on the left behind a 2px ink right rule. It is a fixed frame: the navy contact head and the search hold the top, only the category tree scrolls (with faded edges). Every page's content column is capped at 80rem (`--page`) with a fluid gutter of `clamp(1rem, 0.4rem + 1.8vw, 2rem)`. Bands and fields bleed past the column to the sheet's edges while their text stays in it. The catalogue's ruled cells reach a further `--bleed` past the column so their text lines up with the page text. The ink footer starts its column after the rail too, so it lines up with the content, not the viewport.

Spacing is a 0.25rem scale. Block internals use 2 to 6. Homepage blocks are 2.5rem apart (1.25rem under a Title, 4rem before one). Bands run 2rem (Siedziba on phones) to 3rem (Siedziba beside its map, SEO, closing ask) of vertical padding. The hero has more above than below, both growing with the page (2.5 to 5.5rem over it, about 72px at 1440px; 2 to 4rem under it, about 56px; 2rem over it on a phone, under the bar).

Below 61.25rem the rail is gone. A sticky, frosted paper bar 3.25rem tall (3.75rem from 47.5rem) carries the logo, an orange-outlined Zadzwoń pill and an ink-outlined Menu pill (below 24rem Zadzwoń drops its handset icon, below 21.25rem both pills narrow, so the bar fits a 320px phone). Menu opens a full-screen overlay on paper under a navy head that reuses the rail's content. The bar is the same on every page, the homepage's too: the hero starts under it, its machine first and as wide as the text column, on its edge.

Breakpoints, each with a job:
- **35rem / 38.75rem**: product cards take their larger padding; catalogue cells go two across; the map's column gap widens.
- **47.5rem**: the hero leaves its phone order (machine first) for the title across, the lede and buttons beside the machine; the SEO copy goes two columns; the footer goes two columns; the top bar grows.
- **56.25rem**: CMS banners keep their authored grid placement (below it they linearise to two columns, one below 35rem); Siedziba sets its map beside the text; the product page's floating Zapytaj button disappears.
- **61.25rem**: the rail appears; the phone bar goes.
- **64rem / 68.75rem / 75rem**: catalogue cells three across; the map four columns; the SEO copy three columns.

### Named Rules
**The Hang Rule.** A pill button that starts a text column hangs past it by `--pill-hang` (0.3rem), because its round end otherwise reads as indented. Set flush, it looks out of line with the text above it. On a row of pills, each line's first one hangs. Stacked full-width pills on a phone hang on both sides.

**The Column Edge Rule.** Text aligns to the column at every width: the footer's beside the rail, the banners' edges, the catalogue cells' text inside their bleed. A field may run wider than the column; its words may not.

**The Authored Placement Rule.** A CMS banner's 4-column placement is honoured untouched from 56.25rem up. Below that it linearises via `!important`, the only thing that beats `Tile.svelte`'s inline grid placement, and banner text scales with container units (`cqw`), not the viewport.

## Elevation & Depth

Flat. Depth is carried by fields and rules, not by light. A band is a flat navy field; a section boundary is a 2px ink rule (top and bottom of Siedziba, the bar's foot, the rail's edge, the SEO, map and ask bands, the category toolbar). Rules never double where a band meets a band or the hero. A hover on a card or pager thickens its edge with a 1px outer ring of the same colour (ink on hover), so nothing shifts. A CMS banner hovers with a 2px inset ink frame. Neither is a shadow in any visual sense.

### Shadow Vocabulary
- **Overlay** (`0 0.25rem 1rem` to `0 0.5rem 1.5rem` of ink at 0.18 to 0.28): only on things that genuinely float over the page. These are the product page's toast, the phone's floating Zapytaj button and a gallery thumbnail zoomed 2× over its neighbours.

### Named Rules
**The Rule Not Shadow Rule.** A 2px ink rule separates; a navy field groups. A resting card, band or panel never takes a shadow.

## Shapes

Two shapes and one exception. Blocks are square: product cards, catalogue cells, bands, the footer map (`square`). Controls are full pills (`pill`) squircled with `corner-shape: squircle`: buttons, fields, selects, the search field, pager buttons, badges, the skip link. A textarea can't be a pill, so it takes `field`. The question form's inquiry panel is the one rounded container (`card`, squircled, 2px orange frame over a faint orange halftone). CMS banners take `banner`, squircled, at every width: 4rem on the widest, 1.5rem on a phone.

Icons are inline stroked SVG (2 to 2.2px stroke, round caps) in `currentColor`. Arrows slide 0.1875rem on hover and stay put under reduced motion. Colour swatches are circles with a 1px inner ring. Motion uses two curves: `cubic-bezier(0.2, 0.7, 0.3, 1)` (`ease`) for movement (arrows, chevrons, the map's dots, photo fades) and, for a hover's colours (grounds, borders, rings, link colours), `cubic-bezier(0.4, 0, 0.2, 1)` (`ease-hover`), which starts soft: a pointer there for a frame, crossing a control's edge or a hand shaking on it, changes nothing seen, where the quick start showed it as a flash. 110ms for hovers and borders, 200ms for buttons, arrows and photo fades. A button's label colour doesn't fade but swaps at once, 30% in (its ground about 40% of the way): faded, orange to ink over orange, it passed through the ground's own shade and blinked out. A global reduced-motion clamp applies.

## Components

### Buttons
- **Shape:** full pill, squircled, 2.75rem min height, 1.5rem side padding, 0.875rem at 700, 2px border (transparent on filled variants).
- **Ink:** the neutral primary on paper ("Strona główna"). Hover lifts to ink-700.
- **Light:** white on navy: the hero's catalogue button.
- **Orange:** contact on paper or in a band (Siedziba, empty category, error page, rail Kontakt). Ink text; hover lightens to `contact-orange-light`.
- **Ghost orange:** contact on navy (the hero's "Napisz do nas", the phone menu's Kontakt). `contact-orange-small` outline and text, filling orange with ink text on hover.
- **Ghost light:** a white-outlined pill on navy or ink: the footer's social link.
- **Phone:** the closing ask's and the phone bar's call pill: orange outline, `contact-orange-deep` text, filling orange with ink text on hover.
- **Go:** REED red pill with a trailing arrow that slides on hover (reversed for back). It is the CMS Title block's link.
- **Disabled:** paper-4 ground, ink-400 text, `not-allowed`.

### Navy Bands
- **Hero:** full-bleed navy, ruled below (not where banners lead the page: they start right under it, its navy going on behind their top), white two-tone hero line (the emphasised clause in orange), a `navy-text` lede at 50ch, a Light plus Ghost orange pair hung on the column. The machine is a shop drawing (`HeroMachine`, 716 x 422): white line work on the navy over a faint fading grid, parts filled so lines behind them hide, line weight constant on screen, and one orange mark per station, the client's logo's place in the orange of the hero line's "z Twoim logo" (REED's own plate on the printer's door stays red; the glows, heat, stay red) (the forms' and the printer's prints, the stamp's ink, the mug's and the pen's engravings, the front shirt's print, the wall calendar's logo on its header; the engraver's head carries a faint band of it, the logo's paint, as big as the logo it engraves). Left to right: a printer of continuous self-copying forms low on its post, the forms out between two rolls a page at a time, a knife at the perforation and a box on the floor under it; a printer (REED's plate on its door) with a paper hopper on top (one blank sheet in front, two fainter ones behind it) and an out tray where its vents were; then, close by, one belt with a stamp press over a business card (its lever pivoting over the ram, its swing arrowed), an engraver (a narrow beam, a small cylindrical head, a tapered tip, its band hidden behind the mug at the logo's height while it engraves) over a mug with a slim rotator beside it, and a laser over a pen (its clip by the cap, pointing to the tip), the card and the pen fed from faint dispensers behind (outlines only, their blanks stacked in them), the mugs waiting in a row behind the engraver's, going back towards its post, each further back and fainter, a thin chute into boxes (REED's red packing tape round them and the forms' box, faint, the logo repeating along it, and on the closed big box down it too, top to bottom a little left of its middle, over the other where they cross (both faint as one), under its shipping label (a white card, outlined, as faint as the tape); the open boxes carry no tape over their tops; pinned at the belt's end roller, a strut under it to the bench, its foot on the box's rim, its top on the line what slides down it takes, at its tilt; pens leaning against each other and the box's right edge), printed shirts on a rail over them and a three-fold calendar hanging on the wall behind the shirts (a little faint, at 75%; today a heavier box in the first month); business cards (one leaning on the stack, face out, a red print and no logo), paper, roll-ups and two desk calendars (the one behind fainter; big spiral rings, the month's grid filling it) wait on the brace under the belt. It runs, in CSS keyframes in the drawing's own units, written by the script into the head from timings in seconds (one table per machine), only while it's on screen (an IntersectionObserver stops it) and at 60 frames a second at most (its CSS animations paused, their time set by the component on requestAnimationFrame, every frame under 1/60s since the last skipped; the screen's own rate is 120 or more on some), and never under reduced motion, where it stands still with every mark made; every jump back is a step, unseen. On the belt, a 5.6s cycle: the stamp's plate heats up while it's still up (a soft red halo, the plate itself the sparks' hot red; from 0.6s before it moves), the stamp comes down (its lever pulled, its spring stretched), brightest as it lands, and is cool again once it's back up, the engraver comes down behind the mug and the rotator's wheel onto its side, and the mug turns once round, its handle back where it was (its handle drawn behind and in front, squeezed to the cosine of its angle; the mark there from half the turn, when its place passes the engraver at the back, coming round to the front as the turn ends), the laser fires, each mark appearing as it's made; then the belt runs 22 ticks in 2.28s (its rollers and the motor's pulley turning) to carry the three off its end, down the chute and into the box, and new blanks come out of the dispensers, their stacks coming down a place (each stack drawn a blank taller than its housing shows, so it loops unseen), while the next mug slides in from its row and turns solid, the ones behind moving up a place and a new faint one appearing at the back (then back as they were, the mug in its place: the same); the tools start again 0.6s after. The printer (6.4s) prints ten sheets one after another, each into the hopper (the sheets behind coming forward a place and filling in, a new faint one appearing at the back) and out of its slot into the tray, shaking a little while it prints, then rests; the forms printer (17.4s) cuts six pages one after another, each fed out (the rolls' stripes turning with it), held while the knife crosses the perforation and falling into its box, then rests. From 47.5rem it stands beside the lede and buttons at the column's right, its floor line (the viewBox ends there; the hatching shows past it) level with the buttons' bottom, as tall as the title, lede and buttons together, or scaled down just so far that it touches none of them: clear of each title line beside it, and of each of the lede's lines and the buttons by the columns' gap, going by where it's drawn, not by its box (its top left is mostly empty: the printer's hopper and the stamp's lever stand well in from its side, so it can reach up beside the title's short lines; its outline is read off the drawing once, what its clips hide left out) (`heroFit`, measured on every resize once the fonts are in; it also puts "Porządnie," on its own line where that lets the machine be bigger). Absolute in its cell, it adds nothing to the row, so the lede always sits right under the title. On a phone it goes first, its tallest parts just over the clear bar's line, and the title shrinks a little (at most 10%) so "do kieszeni. Porządnie," fits one line. The lede's last sentence, "Na własnych maszynach, w Kaliszu, od 2002 roku.", is a line of its own.
- **Siedziba:** navy, ruled top and bottom, a Headline head, a muted lede (64ch at most, balanced: two lines where they fit, and none ever left with a word or two), a dot map of Poland, a list of places and an orange "Napisz do nas" hung on the column; the map under the lede on phones, beside the text (which centres against it) from 56.25rem, taking 45% of the row (20 to 32rem), not all it could before the text gets any. The map is the hero's blueprint grid made of dots (`layout/elements/poland.js`: a hand-traced outline, a square grid of 0.15° rows, about 17 km), the grid's dots at 30% of the navy text colour; the two missing at the top are the Vistula Lagoon, kept (owner's call, 2026-10-14). Where the website's visitors came from (`visits.js`, a snapshot of Umami's cities, read off its panel since the free plan has no API) the dots are orange, contact's colour, bigger and brighter in eight steps on a log scale, so Warsaw's hundreds and a town's one or two both tell: one visitor a pale orange dot just bigger than the grid's (`--cold`), the most a big bright one (`--hot`, the orange; mixed in oklab), no outline. Kalisz is the orange ringed white with a white dot in its centre (in the list the same), biggest, with a slow spreading orange ring (still under reduced motion). The list names Kalisz and the eleven most visited places, each after its dot (sized and coloured as on the map), and nothing says what the dots count: the list implies the reach, and no wording claims clients there (the dots are visits; owner's call, 2026-10-14). Pointing at a place, in the list or on the map (any orange dot: the ones not in the list are named too), grows its dot 1.8×, drawn over all the others, and shows its name above it, bigger, both going back as the pointer leaves; in the list it goes white and bolder (Kalisz, bold already, orange), each name as wide as its bold so nothing moves. The list ends "i wiele innych", which grows every other dot, then "Twoje miasto?" (a button after a ring): pointed at, tapped or focused and clicked, one of the grid's grey dots (no visitor from there yet) lights up white, grown, "Twoje miasto?" over it, a different one each time, fading out as the pointer leaves.
- **SEO:** navy, ruled above, a Title head and a lede. The long copy is always open, in 1 to 3 columns with a thin navy column rule.
- **Rail contact head:** navy, as tall as the category toolbar's foot, carrying the logo, the phone and email line in small type, and the full-width Kontakt (orange, white on /kontakt).

### Catalogue Cells
Ruled cells on paper. The rules are the hairline grid background showing through 1px gaps. Each cell carries a section icon, a Subtitle name and a real count ("Na zamówienie" for made-to-order sections). The grid runs 1, 2, then 3 across, and a short last row spans. Hover grounds the cell in paper-2, turns the name red and lifts the icon slightly.

### Catalogue Map
A paper-2 band behind a 2px rule, always open: a Title head over 2 to 4 columns of section heads, subcategories and hairline-indented leaves, red on hover, with taller rows for touch.

### Closing Ask
The page ends on the question: a paper band behind a 2px rule, a Headline, a muted lede, and the write and call buttons beneath. On a phone the buttons stack full width and hang on both sides.

### CMS Banners
Tiles authored on a 4-column grid, squircled at every width (`banner`: 4rem on the widest, 1.5rem on a phone) and apart (0.75 to 1.25rem), in the column like the product cards under them. Banners leading the page start right under the hero, its navy going on behind their top (3 to 6rem). Every banner stands on a ground (`ground`, one of eight pastels in `layout/grounds.js`, light tints of the site's own colours, Papier first and a new banner's; one saved before the grounds gets Papier and its photo over the whole tile) with its title, subtitle and a small button (the whole tile is the link) on a paper panel ruled 2px in ink at its left, legible on any picture, its corners nested in the tile's (the tile's radius less the inset, 0.75rem at least). There is no red tile and no text colour to pick any more: the ground and the panel replaced them. Panel sizes follow the window, not the tile, so every banner on a page has the same panel, centred on the tile's height, never narrower than its longest word (no word is hyphenated: a broken one left the panel a hole beside it); tiles grow to fit it, their proportions a minimum (`overflow: clip`, not a scroll container, so they can). A tile narrower than 30rem (a phone's, a tablet's half tile, a one-column one on a small screen; a container query on the tile) is a poster: its picture's room first, at least 16:10, from the tile's top and sides down to the panel, taking what a taller tile beside it leaves, and the panel under it across the tile, a label; its subtitle runs on (its lines are set for a narrow panel), a word too long for it hyphenated (`hyphens: auto`, the page in Polish; broken only where it can't be), and its button is only its arrow, in the panel's top right corner, so the panel is shorter. A tile alone in a phone's row but 30rem or wider (a phone on its side, 30 to 35rem) puts the picture's room first beside the panel instead: from the tile's top, left and bottom edges to a 17rem panel at its right, as far in from the tile's right edge as from its top and foot, its subtitle running on. Below 56.25rem the tiles follow one another in their grid's order, row by row, two across, their proportions a minimum height on the tile taken from its cell's width (4:3; a wide one, 3-4 columns, takes the row at its own, columns to rows, 4:1 for a row of four), never the cell's aspect ratio: the cells stretch, so two in a row are always as tall as each other, and a card taller than the proportions grows its tile. Below 35rem, one to a row, a tile is as tall as its content (the poster, or from 30rem the picture beside the card). The picture (served as WebP by Directus's `banner` preset once it exists: the homepage's load asks Directus, so the page is rendered with the address that works and nothing swaps on the page, and a failed ask keeps the last answer; one failing anyway falls back to the original, checked once mounted too; loaded lazily, decoded off the main thread) takes the tile one of four ways (`fit`), always centred: in the room beside the panel (`side-`: from the panel's edge, no gap, to the tile's top, right and bottom edges) or in the whole tile under the panel (`full-`), covering it (`-cover`: as big as covering the room takes, once its proportions are known; the room cuts nothing, so what sticks out runs under the panel and only the tile's edges cut it; no shadow) or contained (`-contain`: whole, edge to edge, a soft shadow under it). A banner's `margin` ("Margines", for a picture with no room of its own round it) insets the room from the tile's edges and the panel by half the panel's padding (0.8 of it on a narrow tile). Banners stay title, subtitle and button as live text, never text baked into the picture: it is indexed, read aloud, and survives the re-crops below 56.25rem.

**The homepage editor** (an admin's "Edytuj układ") is a panel over the rail (18rem: the rail's 16.5 and part of the gutter, never over the page's text), in the admin's look and with its components, loaded only when editing starts. The page beside it is the page as it is, every change showing at once. Every block is framed in faint dashed navy with its name on a tab, darker under the pointer; a click picks a block or a banner (a banner framed 4px in navy, a hidden one faded grey; the picked one gets a navy pill across the middle of each side, white-edged, its arrow pointing out outside the edge growing it a cell that way, the one pointing in inside it shrinking it from that side, one with nowhere to go not shown (a side with neither, no pill); and, while it's pointed at (so typing in the panel leaves it as it is), big navy arrows outlined white, each by the middle of its side, its tip 0.5rem in from that side's pill, as far from the edge on every side (one with no pill as by a one-button pill; by a two-button one further in), only those it can take: each moves it the fewest cells it can: into free cells, a step or over the banners on the way (one too big to swap with, a whole row's, say), or past a strip of the banners beside it that none sticks out of, they taking its place, a swap; never off the grid, down past the spare row or leaving a row empty), and in the grid's free cells and one spare row a dashed, squircled "+ Baner" adds one there. A picked block (not a built-in one) also gets its own buttons, up, down, hide and delete, in the tag's navy right beside its name, the two sticking to the window's top while the block scrolls by. The panel shows the page's blocks (picked from the list, the page scrolls to them; Tytuł, Kafelki or Kategoria added on top), a block's settings (moved, hidden, deleted; a title's lines, button and link; a category; a tiles block's banners) or a banner's: the picture from the admin's file library (a field's row, the picture small on a check, its name and size), how it takes the banner (four drawn choices on a squircled 2:1 banner, a disc doing what the picture will in its room, dashed where it isn't the whole banner: as big as covering it takes and cut only by the banner's edges, or touching it edge to edge when contained, beside the card or in the whole banner) and "Margines" under them (the drawings showing the inset room), the ground (the admin's select with swatches), the title and subtitle as plain lines (each a line on the banner; what the page keeps stays HTML), the button and its link (its size is the arrows on its sides on the page, its place the big ones inside them; the tiles block's panel says so, and that phones stack banners in the same order). Its foot keeps or drops the changes ("Zapisz zmiany", "Odrzuć"), or leaves ("Zakończ edycję"); the admin's floating buttons step aside while it's open, and offer "Edytuj układ" on the homepage only. Leaving the page with changes asks first, the admin's own question ("Zostań" / "Opuść"; closing the tab gets the browser's); leaving without them closes the editor.

### Product Cards
- **Corner Style:** square.
- **Background:** white; out of stock drops to paper-2 with a greyed, half-faded image; Chwilowy brak fades the whole card to 0.8 until hovered.
- **Edge:** a 1px hairline, recoloured by state (red sale, purple new, green bestseller, blue coming soon). On hover it turns ink and doubles through an outer ring.
- **Structure:** a 1:1 white media well (a second photo fades in on hover), a two-line clamped 700 name over its mono code, colour swatches cut off with "+N", then the price row behind a paper-3 divider: "od", the price in `price`, red when on sale with the old price beside it. Focus draws a 3px red inset outline on the whole card.

### Badges
Mono uppercase pills with a 1.5px white ring: Nowość purple, Promocja red, Bestseller green, Wkrótce blue-light with navy text, Brak ink-600, Chwilowy brak paper-3.

### Inputs / Fields
White pill fields on an ink-300 hairline that darkens to ink-600 on hover. Focus is a 2px offset ring in the focus colour, with no border change inside it. That colour is red in general and orange inside the question form. Selects swap the native arrow for an ink chevron. The search field is one pill that takes the ring itself, with a compact round submit that turns red once there's a query. Errors stay red (`reed-red-tint` ground, `reed-red-deep` text) even inside the orange form.

### Navigation
- **Rail:** the whole navigation, a fixed frame (navy head, search, scrolling category tree with REED's own emoji titles), sticky beside the content.
- **Phone bar and menu:** described under Layout. Zadzwoń is orange because it is contact; Menu stays ink.
- **Pagination:** pill buttons on an ink-300 hairline, thickening to an ink ring on hover.

## Do's and Don'ts

### Do:
- **Do** give every contact control (to /kontakt, to the phone, the question form) the contact orange, with ink on its fills and `contact-orange-deep` for orange text on paper.
- **Do** keep red for action, current state, focus, the sale badge and the logo tile.
- **Do** use navy for structural bands only, with white heads and `navy-text` copy on them.
- **Do** separate blocks with a 2px ink rule and never double it where two bands meet.
- **Do** hang a pill that starts a text column by `--pill-hang` (`.hang`), and hang stacked full-width pills on both sides.
- **Do** keep text on the column edge at every width, including inside full-bleed bands, banners and the footer beside the rail.
- **Do** set section heads at `headline` and leave `hero` to the hero.
- **Do** keep blocks square and controls pill-shaped and squircled; the inquiry panel's card radius and the banners are the only rounded containers.
- **Don't** fold the SEO copy or the catalogue map behind a disclosure: opening one makes the page jump, and visitors who never click miss what's in it (owner's call, 2026-10-13).
- **Do** end the homepage on the closing ask and every product page on the inquiry.

### Don't:
- **Don't** use orange for promotions, sale prices or decoration; the sale badge and sale price are red.
- **Don't** put a resting shadow on a card, band or panel. Shadows belong to genuine overlays only (toast, floating button, zoomed thumbnail).
- **Don't** add a third shape (an in-between radius on a card or a band), or round the product cards.
- **Don't** add a third type family, and don't set a second element at hero size.
- **Don't** write a kicker, eyebrow or decorative label line above a heading. Mono uppercase is for codes, functional captions and badges.
- **Don't** design cart, checkout, quantity or order-status affordances; inquiry is the business model.
- **Don't** imply proof that doesn't exist: no testimonials, client logos or names, case studies, ratings, turnaround promises ("wycena w 24 h") or invented counts. The catalogue count is rendered from data.
- **Don't** use glyph or emoji icons in the chrome (REED's own emoji in category titles are content, not icons); icons are inline stroked SVG in `currentColor`.
- **Don't** hardcode a colour, radius, duration or gap when a token exists, and don't reach for the legacy `--main` / `--light` aliases in new work.
- **Don't** hardcode homepage composition: the CMS blocks (title, tiles, category, plus the fixed catalogue and Siedziba) must keep working.
- **Don't** replace, recolour or retype the REED logo.

---

# Design System: REED Kalisz — Admin Panel

<!-- A second, separate system in this file. The YAML frontmatter at the top belongs to the public website; the admin's
     tokens are the block below (normative for /admin), mirrored in .impeccable/design-admin.json. Source of truth:
     frontend/src/lib/shared/styles/ui-admin-scope.css (imported by ui-admin.css). -->

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
- **Status tints** (`info-blue`, `success-green`, `warning-orange`, `new-purple`, `danger-red`, each with 200 / 300 steps in ui-admin-scope.css): Tone buttons and row states. Never text colours, never large surfaces.
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
**The One Ink Rule.** Every line, caption and button on the form is printed in the navy ink or that ink seen through (alpha). There is no black and no neutral grey line; a colour not in ui-admin-scope.css is one of its families.

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
- **Tones:** info, selected, success, warning, danger, new, and a diagonal orange/purple split, each its family's 100 / 200 / 300; and note, the optional boxes' ply yellow deepening to yellow-100 when pressed (left as it is by choice, not wrong - an ignored category or labeling gets a yellow-500 X, a category with ignored ones under it a yellow-500 dot).
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
- **Do** take every colour, radius and shadow from ui-admin-scope.css; a colour that isn't there is one of its families.
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
