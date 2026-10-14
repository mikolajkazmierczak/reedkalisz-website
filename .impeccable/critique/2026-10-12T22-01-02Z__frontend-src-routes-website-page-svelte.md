---
target: the public homepage
total_score: 22
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mikolajkazmierczak/_reed/reedkalisz-website/frontend/src/routes/(website)/+page.svelte"
target_fingerprint: "sha256:37a3b208b55b3109a6b636329b8399955f2109cb5a10944a4458902b8df65d53"
target_path: /Users/mikolajkazmierczak/_reed/reedkalisz-website/frontend/src/routes/(website)/+page.svelte
timestamp: 2026-10-12T22-01-02Z
slug: frontend-src-routes-website-page-svelte
---
Method: dual-agent (A: design review · B: detector + browser overlay)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good hover/focus (red 2px ring), slider "1 / 19", aria-expanded on menu |
| 2 | Match System / Real World | 3 | Natural Polish; but "1 pozycja / 6 pozycji" frames made-to-order services as a near-empty shop |
| 3 | User Control and Freedom | 3 | Menu: Escape closes, focus returns, scroll locks |
| 4 | Consistency and Standards | 2 | Four labels for one /kontakt goal; orange and red both act as the action colour; block titles out-size section headings |
| 5 | Error Prevention | 3 | Little to get wrong; empty search submit silently does nothing |
| 6 | Recognition Rather Than Recall | 3 | Icons + counts + prices visible; search placeholder "Kod lub nazwa" leans on codes |
| 7 | Flexibility and Efficiency | 2 | No tap-to-call on mobile without opening the menu |
| 8 | Aesthetic and Minimalist Design | 1 | Three duplicate nav systems (rail, Działy, full map) + ~159 inline SEO links; bottom third is a link wall |
| 9 | Error Recovery | 2 | Image-less products show grey placeholder on homepage sliders |
| 10 | Help and Documentation | n/a | Persuade surface |
| **Total** | | **22/36** | **Acceptable (61%)** |

## Design Specificity Verdict

Half authored. REED-only: navy rail with red logo tile, Bricolage 800 two-tone headline, custom section icons, Siedziba band (Dobrzecka 95, pn–pt 10–14, towns), "od X zł /szt ze znakowaniem" price lines. Category-interchangeable: everything below the hero (banners → department grid → four sliders → SEO wall → sitemap → footer). The 3D isometric machine render is the only carrier of "we make it ourselves" and reads illustrative/generated beside "Na własnych maszynach".

Docs drift three ways: DESIGN.md public section still describes Archivo/white/cool-ramp "Well-Run Catalog"; PRODUCT.md still says URW DIN and "not responsive"; surface brief describes a red hero, "Gadżety, które zostają na biurku.", orange promotions-only, zero shadows, ink menu — shipped is navy hero, different headline, orange = contact, radial shadow under machine, backdrop-filter glass on MobileBar and Tile chips.

Deterministic scan: CLI 0 findings (exit 0, also 0 with --no-config; scanner verified to read .svelte). Browser overlay desktop 73 / mobile 29. Real: footer copyright #78746d on #111110 = 4.1:1 at 13px (both assessments agree); badges "Nowość"/"Bestseller" at 10px uppercase (Badge.svelte:6, detector-only catch); mobile body text 14px from viewport edge (DESIGN.md asks 16px gutter); gray-on-color on seo lede (#e3ebf6 on navy, judgement call). False positives: all 59 text-overflow (wrapped inline text), cramped-padding on fixed-height hero button, layout-transition in admin-only HoverCircle, clipped-overflow on intentionally masked tiles/swatches.

## Priority Issues

1. [P1] Print client's path and "under one roof" never staged. Headline addresses gadget buyers only; Działy shows "Pieczątki 6 pozycji", "Tabliczki grawerowane 1 pozycja". Fix: drop counts for service sections in Catalogue.svelte:25 (service line instead); two-up "Gadżety z logo / Druk, pieczątki, druki" via the tiles block under the hero; lede names stamps and forms. → /impeccable clarify, /impeccable layout
2. [P1] Bottom third is an SEO + sitemap dump with no closing ask (~5 phone screens before footer; ends "© 2024"). Fix: Pełna mapa in <details>; SEO blocks collapsed to h3 + disclosure; closing ask band with phone + pn–pt 10–14 (no turnaround promise); dynamic year. → /impeccable distill
3. [P2] Colour roles drifted and docs no longer describe the product. Red reduced to logo tile, sitting above orange Kontakt; orange means contact and promotions. Fix: decide orange's role, then regenerate DESIGN.md public section and update brief + PRODUCT.md. → /impeccable colorize, /impeccable document
4. [P2] Hierarchy and semantics: CMS block titles ~48px vs "Działy katalogu" ~32px; rail "KATALOG" <h2> precedes <h1>; .sec__name <h2> inside the Działy <h2> (Catalogue.svelte:24); skip link targets #main which wraps the rail (+layout.svelte:40/45). Fix: cap block titles at --fs-h2; rail label → span; .sec__name → h3; skip link → .shell__main. → /impeccable typeset, /impeccable audit
5. [P3] Trust paper cuts: "15% taniej*" with no footnote; image-less products in homepage sliders; footer contrast 4.1:1; 10px badges; 12px rail phone. → /impeccable polish

## Persona Red Flags

Jordan: machine render reads generated; flags (Nowości/Bestsellery/Promocje) mixed into departments; no plain "how asking works".
Riley: empty search does nothing; "1 pozycja"; dangling asterisk; placeholder images; "© 2024"; banner legibility depends on blur chips over arbitrary uploads.
Casey: ~12.8 phone screens; machine image pushes "Napisz do nas" to y≈760/812; no tap-to-call in bar; map links ~20px tall; footer OSM iframe captures scroll.
Local print client (office needing stamps + KP/KW forms): hero talks desk gadgets; "Pieczątki: 6 pozycji" reads thin; phone hidden behind Menu; "Umów się albo napisz" implies an appointment; first print products are blank cards "Zapytaj o cenę".

## Minor Observations

Unequal-width stacked hero CTAs on mobile; "twoich" vs "Twoim"; homepage slider "1 / 19" pages through a category's job; og:image is the illustration; body text 14px from edge on mobile.

## Questions to Consider

- With the hero gone navy, what does REED red do now?
- Would one real "made here" photo persuade more than four sliders of supplier shots?
- Who are the SEO band and full map for — Google or the visitor — and can they sit behind a disclosure?
- Should services that aren't products ever show a product count?
