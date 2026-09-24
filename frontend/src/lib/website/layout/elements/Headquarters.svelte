<script>
  const cities = ['Kalisz', 'Ostrów Wielkopolski', 'Pleszew', 'Jarocin', 'Turek', 'Krotoszyn', 'Konin', 'Sieradz'];
</script>

<section class="headquarters">
  <div class="wrap headquarters__inner">
    <h2 class="headquarters__title">Siedziba w Kaliszu, wysyłkowo cała Polska</h2>
    <p class="headquarters__lede">
      <span class="headquarters__s"
        >Z Kalisza i okolic wpadnij do nas na Dobrzecką 95, od poniedziałku do piątku między 10:00 a&nbsp;14:00.</span>
      <span class="headquarters__s">Paczki wysyłamy na terenie całej Polski — prosto pod Twój adres.</span>
    </p>
    <ul class="cities">
      {#each cities as city}
        <li class="city" class:city--home={city === 'Kalisz'}>{city}</li>
      {/each}
    </ul>

    <a class="btn btn--orange" href="/kontakt">Umów się albo napisz</a>
  </div>
</section>

<style>
  .headquarters {
    background-color: var(--navy);
    color: #fff;
  }
  .headquarters__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
    padding: var(--sp-8) var(--gutter);
  }
  .headquarters__title {
    max-width: 22ch;
    font-size: var(--fs-h2);
    color: #fff;
  }
  /* One paragraph on phones, a line per sentence from 56.25rem. */
  .headquarters__lede {
    max-width: 58ch;
    color: #a9bcd6;
    font-size: var(--fs-sm);
    line-height: 1.6;
  }
  @media (min-width: 56.25rem) {
    .headquarters__lede {
      max-width: none;
    }
    .headquarters__s {
      display: block;
    }
  }
  /* A separator before each town, shifted and clipped so no line starts with one. */
  .cities {
    --sep: calc(1px + var(--sp-3));
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-3);
    margin: var(--sp-3) 0 var(--sp-1) calc(var(--sep) * -1);
    padding: 0;
    list-style: none;
    clip-path: inset(0 0 0 var(--sep));
  }
  .city {
    display: flex;
    align-items: center;
    color: #cfdcee;
    font-size: var(--fs-sm);
  }
  .city::before {
    content: '';
    width: 1px;
    height: 0.9em;
    margin-right: var(--sp-3);
    background-color: #3c567d;
  }
  .city--home {
    color: #fff;
    font-weight: 700;
  }
</style>
