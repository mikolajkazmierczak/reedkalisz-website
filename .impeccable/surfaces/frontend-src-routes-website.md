---
version: 1
slug: "frontend-src-routes-website"
primary_target: "frontend/src/routes/(website)"
related_targets: []
---

## Scope

The whole public website: homepage (CMS blocks), category listing with facets, product page, contact, policy pages, chrome, error state. Admin panel untouched.

## Visitor mode

Persuade. The inquiry is the conversion; the catalog is the proof.

## Audience and job

B2B buyers sourcing branded gadgets, and local clients needing print, stamps, forms and engraving. Both browse, then ask. No checkout exists.

## Constraints

Polish only. Inquiry-only. Homepage stays composed from CMS blocks. REED logo fixed. Must not regress speed on a mid-range phone.

**Claims permitted:** the live catalogue count (4700+, rendered from data, not typed); office hours pn–pt 10:00–14:00; in-house laser engraving, pad/digital print, stamps, self-copying forms; founded 2002 (user-confirmed, and worth leading with). Not permitted: anything saying REED worked with clients in the Siedziba map's places (its dots are website visits).
**Claims forbidden** (user-confirmed false or unverified): any quote-turnaround promise including "wycena w 24 h" and "odpowiadamy w 24 h"; physical samples before a run; per-technique minimums or lead times; case studies; testimonials; client names or counts.

## Direction contract

THESIS: A printer's poster, not a catalog template — one paper sheet running edge to edge, flat fields of navy, and 2px ink rules where a softer system would reach for a shadow. Refuses the white-page grid the canon build shipped, the warm-cream ground that reads as generated, and the invented proof the reference mockup leaned on.

OWN-WORLD: Paper ground (#fdfdfc) edge to edge, no mount and no island gaps — separation is carried by 2px rules and by the fields themselves; ink #111110; REED red #bf0417 for action, state, focus, the sale badge and the logo tile; navy #1b2f4e for structural bands, the hero included (owner's call, d4fe51a); orange #c2560b means contact — every /kontakt and phone control and the question form, its bright #ff8a3d on navy — and is never used for promotions (owner-confirmed 2026-10-13). Bricolage Grotesque from Google Fonts, optical-size axis; platform mono for codes and tracked labels. Blocks are square and bounded by rules, controls are pills — no third shape. Shadows only for a genuine overlay. A pill that starts a text column hangs past it by --pill-hang (.hang), so its round end sits optically on the column's edge. The left rail is the whole navigation and a fixed frame, not a stack: logo and search hold the top, the category tree is the only part that scrolls, contact and the phone line pin to the bottom.

STORY: The visitor sees that REED makes the mark as well as supplying the object, narrows by category and facet, reads price-from and colourways at a glance, and sends an inquiry from beside the price.

FIRST VIEWPORT: One paper sheet, edge to edge. Left: a ruled rail carrying the REED mark at 46px, a compact search, the category tree with REED's own emoji titles intact, and Kontakt. Right: a full-bleed navy field with the display line "Na biurko, na ścianę, do kieszeni. Porządnie, z Twoim logo." two-toned white/bright orange over a shop drawing of the workshop line (a self-copying forms printer with its knife and box, a printer with its hopper and out tray, then along one belt a stamp press, a mug engraver with its rotator and a laser fed by faint dispensers, shirts on a rail before a three-fold wall calendar, boxes) in white line work with one red mark per station, running while it's on screen, over a lede naming in-house engraving and print, stamps and self-copying forms, since 2002, and two actions — catalogue and contact. Beneath it, the CMS blocks; catalogue sections as ruled cells carrying real counts (made-to-order sections say "Na zamówienie" instead). The page ends on a closing ask (write or call, office hours), after the SEO copy and the full catalogue map. On a phone the rail collapses into a slim bar with Zadzwoń and Menu pills and a full-screen menu on paper under a navy head.

FORM: User-pinned direction. Derived from the client's own Claude Design comps, then moved off their bone ground to a paper-and-flat-field poster at the user's direction, and stripped of their fabricated proof and template tics. Supersedes the canon build of seed 3273f350.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

Facet vocabulary is derived from live data (marking technique, body colour, price band); no invented facets.
