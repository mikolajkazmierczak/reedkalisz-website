<div class="info">
  <h1>Formuła do obliczania ceny</h1>
  <pre>
    p = NAKŁAD * CENA
    pm = MAX(p * MARŻA NA PRODUKT, p + MIN NA PRODUKT)

    zp = CENA ZNAKOWANIA Z ODPOWIEDNIEGO PRZEDZIAŁU NAKŁADÓW
    z = JEŚLI(NAKŁAD = 1, ZC + PRZYGOTOWALNIA, NAKŁAD + PRZYGOTOWALNIA)
    zm = MAX(z * MARŻA NA ZNAKOWANIE, z + MIN NA ZNAKOWANIE)

    c = pm + zm
    cm = MAX(c * MARŻA NA CAŁOŚĆ, c + MIN NA CAŁOŚĆ)

    t = JEŚLI(p > PRÓG TRANSPORTU, 0, TRANSPORT)
    cena = cm + t
  </pre>
  <img src="/imgs/price_formula.svg" alt="" />
</div>
