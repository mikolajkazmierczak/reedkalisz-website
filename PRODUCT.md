# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences the public site must serve roughly equally:

- **B2B buyers sourcing branded giveaways** — marketing, office or purchasing staff at a company looking for promotional gadgets (pens, mugs, calendars). They browse the catalog, narrow by category, compare, and send an inquiry about a specific product. There is no self-serve purchase.
- **Local clients needing print work** — nearby businesses and individuals needing stamps, self-copying forms, stickers, laser engraving and short-run digital print. Many already know REED; the site confirms capability and gives them a way to ask.

A third, internal audience uses the same codebase but is **out of scope for design work**: REED staff in the admin panel (`/admin`), who manage products, categories, menus, pages, colors, files, price calculators, supplier API imports and incoming inquiries.

## Product Purpose

A public catalog and inquiry channel for REED, a printing and advertising company in Kalisz, Poland, backed by an admin panel that keeps that catalog current with far less manual work than the client's previous system.

Success on the public site is a visitor who finds a relevant product or service, understands what REED can make, and sends an inquiry. Success internally is catalog maintenance that stays cheap: adding a typical new product from scratch measured at 76 seconds against 442 seconds on the previous system.

## Positioning

**Print and gadgets under one roof.** Most promotional-gadget sellers resell a supplier catalog and nothing more. REED also runs its own digital short-run printing, laser engraving, stamps and self-copying forms, so a client gets both the item and the printing from one supplier. This is the claim a neighboring reseller could not truthfully copy, and it is what the public site has to communicate.

A supporting mechanism, real but secondary as a public claim: products are imported from nine external supplier APIs and repriced on demand through REED's own configurable calculators, so listed prices reflect REED's current margins rather than a stale export.

## Operating Context

- Visitors arrive at a Polish-language site and browse through a **nested, progressively expanding category menu** that filters the product grid. Product tiles carry status badges (new, sale, bestseller, coming soon, out of stock).
- A product page shows a gallery, per-supplier stock availability, price tables (base prices and labeling-dependent prices), recommended products from the same category, and an inquiry form.
- **Inquiries are the conversion.** The form takes email (required), phone, name and message (required), and prefixes the product code onto the message body. It posts to the `questions` collection; staff answer them from the admin panel, where inquiries that arrived by other channels can also be entered.
- The homepage is **composed in the admin** from a small block vocabulary: title, tiles, category, whitespace. Contact, privacy-policy and information-obligation pages render Markdown fragments edited in the CMS. The footer is likewise three CMS fragments plus a menu.
- Contact page embeds an OpenStreetMap view of the Kalisz premises.
- Usage is measured with Umami analytics (script in `frontend/src/app.html`).

## Capabilities and Constraints

- **Stack:** SvelteKit 4 frontend (`frontend/`, dev on port 5000) over a Directus REST API (`backend/directus`, port 8055), plus "Heimdall", a custom socket server and supplier-API middleman (`backend/heimdall`, port 9999). Caddy fronts all three. Shared field definitions and calculation logic live in `shared/`.
- **Styling is hand-written CSS**: three files in `frontend/src/lib/shared/styles/` (`global.css`, `ui-website.css`, `ui-admin.css`) plus component-scoped `<style>` blocks. No CSS framework, no design-token layer beyond the `--main-0..9` red scale and a handful of surface/state variables. The public site sets its type in **URW DIN** (Adobe Fonts/Typekit); Fira Sans, loaded globally from Google Fonts, is the admin panel's face.
- **The public site is effectively not responsive.** The whole `src` tree contains exactly one `@media` rule, in a scrollbar declaration. Fixed pixel widths (e.g. `width: 800px` on the contact page) and a `padding: 0 4rem` fixed header mean small screens break. The viewport meta tag is present, so nothing structural blocks a fix. **This is a known gap, not a decision** — the user has confirmed mobile must work, and responsive behavior is a requirement for future public-site work.
- Nine supplier adapters exist (AXPOL, BlueCollection, BlueCollectionXML, EasyGifts, Macma, MidOcean, PAR, Promotionway, USBSystem). Availability is computed live rather than stored.
- Directus exposes a public field allowlist; a newly added column returns 403 for the whole public query until it is granted.
- The production instance is treated as read-only from this workspace: inspect, never mutate.

### Explicitly undecided

- Nothing product-level is pending. Future scope named in the README (more supplier integrations, scheduled publication and repricing) is internal tooling, not public-site product truth.

## Brand Commitments

- **Name:** REED, Kalisz. Public site at `reed.kalisz.pl`.
- **The red identity is fixed.** The `--main-0` … `--main-9` scale anchored on `--main: #bf0417` is a brand asset, as are the existing logo files (`frontend/static/logo.svg`, `logo_black.svg`, `logo_red.svg`, `logo_white.svg`).
- **Polish only.** All copy, route names (`/produkty`, `/kategorie`, `/kontakt`) and labels stay Polish. No i18n layer is planned; do not design for translation.
- **Inquiry-only, no checkout.** No cart, no online payment, no order status. This is the business model, not a missing feature — never design toward e-commerce affordances.
- **Convention over novelty, at a high craft bar.** Offered a full slate of distinctive visual worlds for the public site on 2026-09-22, the user deliberately chose the category standard — the arrangement a B2B catalog buyer already expects — and named the quality bar as large retail catalogs (IKEA, Muji, Decathlon) for structure and responsive behavior, and SaaS-grade marketing sites (Stripe, Linear, Vercel) for typographic and spacing finish. Future design work executes conventions straight, without irony or smuggled novelty, and competes on craft and speed rather than on arrangement.
- **The homepage must stay CMS-editable.** Any redesign keeps the admin's block composition (title / tiles / category / whitespace) working; it must not hardcode a homepage REED can no longer change.

## Evidence on Hand

- **Product imagery comes from supplier APIs.** There is no original REED photography of products.
- **There is nothing else.** No testimonials, no client names or logos, no case studies, no press, no certifications, no published customer numbers. Future work must not fabricate any of these, and must not imply them through placeholder shapes that read as proof.
- Real, usable material: the live product catalog and its categories, supplier stock and price data, the CMS fragments REED already writes (about, office, rights, contact, privacy policy, information obligation), and the Kalisz location.
- The 76s-vs-442s product-entry figure and the "elementary usability tests" in the README describe the admin panel and came from the project's own thesis work. They are not public marketing claims; do not put them on the customer-facing site.

## Product Principles

1. **Both audiences, one site.** A gadget buyer and a local print client must each find their path without the other's content getting in the way.
2. **The inquiry is the conversion.** Every public surface is measured by whether it gets a qualified visitor to ask. Design toward asking, never toward buying.
3. **Under one roof is the message.** Where the site makes a claim, it is that REED makes and prints, not merely resells.
4. **Say only what is true.** With no testimonials, clients or case studies on hand, persuasion has to come from the catalog, the work, and clear capability statements — never from invented proof.
5. **REED keeps control of the content.** Anything the CMS edits today stays editable tomorrow.

## Accessibility & Inclusion

No formal standard has been established for this project. One concrete, user-confirmed requirement stands: the public site must work on small screens, which today it does not.
