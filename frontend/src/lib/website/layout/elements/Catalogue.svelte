<script>
  import SectionIcon from '#c/SectionIcon.svelte';
  import { plural } from '#/utils';

  export let summary;
</script>

{#if summary?.sections?.length}
  <section class="catalogue" aria-labelledby="catalogue-title">
    <header class="catalogue__head">
      <h2 class="catalogue__title" id="catalogue-title">Działy katalogu</h2>
      <span class="catalogue__wave" aria-hidden="true"></span>
      <a class="catalogue__all" href="/kategorie/_">
        Wszystkie produkty
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </header>
    <div class="catalogue__grid">
      {#each summary.sections as s (s.id)}
        <a class="sec" href={s.href}>
          <div class="sec__icon"><SectionIcon name={s.name} /></div>
          <div class="sec__text">
            <h2 class="sec__name">{s.name}</h2>
            <span class="sec__count tnum">{s.count} {plural(s.count, ['pozycja', 'pozycje', 'pozycji'])}</span>
          </div>
        </a>
      {/each}
    </div>
  </section>
{/if}

<style>
  .catalogue {
    background-color: var(--surface);
  }
  .catalogue__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2) var(--sp-5);
    padding: var(--sp-6) var(--gutter) var(--sp-4);
    border-bottom: 1px solid var(--border);
  }
  .catalogue__title {
    font-size: var(--fs-h2);
  }
  /* Strongest at the arrow; runs while the link or a card is hovered and rests where it stopped. The path
     overshoots its tile, so the repeats join without gaps. */
  .catalogue__wave {
    --wave: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10'%3E%3Cpath d='M-10 5q5-6 10 0t10 0t10 0t10 0' fill='none' stroke='%23000' stroke-width='2.5'/%3E%3C/svg%3E");
    flex: 1 1 2rem;
    height: 0.625rem;
    background-image: linear-gradient(
      to right,
      color-mix(in srgb, var(--red) 15%, transparent),
      color-mix(in srgb, var(--red) 80%, transparent)
    );
    -webkit-mask: var(--wave) 0 0 / 1.25rem 0.625rem repeat-x;
    mask: var(--wave) 0 0 / 1.25rem 0.625rem repeat-x;
    animation: wave-run 0.6s linear infinite paused;
  }
  .catalogue:has(.catalogue__all:hover, .sec:hover) .catalogue__wave {
    animation-play-state: running;
  }
  @keyframes wave-run {
    to {
      -webkit-mask-position: 1.25rem 0;
      mask-position: 1.25rem 0;
    }
  }
  /* Touch has no hover to run the wave or redden the link. */
  @media (prefers-reduced-motion: reduce), (hover: none) {
    .catalogue__wave {
      animation: none;
    }
  }
  .catalogue__all {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    color: var(--ink);
    font-size: var(--fs-sm);
    font-weight: 700;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }
  .catalogue__all svg {
    width: 0.9375rem;
    height: 0.9375rem;
    transition: transform var(--dur) var(--ease);
  }
  .catalogue__all:hover {
    color: var(--red);
  }
  .catalogue__all:hover svg {
    transform: translateX(0.1875rem);
  }
  @media (hover: none) {
    .catalogue__all {
      color: var(--red);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .catalogue__all:hover svg {
      transform: none;
    }
  }
  /* Rules are the grid background showing through a 1px gap; the last cell spans a short row. */
  .catalogue__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background-color: var(--border);
  }
  .sec {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    -webkit-user-select: none;
    user-select: none;
    padding: var(--sp-4) var(--gutter);
    background-color: var(--surface);
    color: var(--ink);
    transition:
      background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .sec:hover {
    background-color: var(--paper-2);
    color: var(--red);
  }
  .sec__icon {
    flex: none;
    width: 3.25rem;
    color: var(--ink);
    transition: transform var(--dur) var(--ease);
  }
  .sec:hover .sec__icon {
    transform: translateY(-0.1875rem);
  }
  @media (prefers-reduced-motion: reduce) {
    .sec:hover .sec__icon {
      transform: none;
    }
  }
  .sec__text {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    min-width: 0;
  }
  .sec__name {
    font-size: var(--fs-h3);
    font-weight: 700;
    line-height: 1.15;
  }
  .sec__count {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }

  @media (min-width: 38.75rem) {
    .catalogue__grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .sec:last-child:nth-child(2n + 1) {
      grid-column: 1 / -1;
    }
  }

  /* Nine sections, three rows of three. */
  @media (min-width: 64rem) {
    .catalogue__grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .sec:last-child:nth-child(2n + 1) {
      grid-column: auto;
    }
    .sec:last-child:nth-child(3n + 1) {
      grid-column: 1 / -1;
    }
    .sec:last-child:nth-child(3n + 2) {
      grid-column: span 2;
    }
  }
</style>
