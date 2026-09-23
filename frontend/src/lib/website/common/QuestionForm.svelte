<script>
  import { tick } from 'svelte';
  import api from '$/api';

  /** 'product' or 'contact' — sets the flag the admin filters inquiries by. */
  export let source = 'contact';
  /** Present on a product page; its code is prefixed onto the message. */
  export let product = null;

  let email = '';
  let phone = '';
  let name = '';
  let content = '';
  let honeypot = '';

  let consent = false;
  let sending = false;
  let errors = {};
  let form;

  /** Last sent payload; resending unchanged content is blocked. */
  let sentSignature = null;
  $: signature = JSON.stringify({ email, phone, name, content: content.trim(), code: product?.code ?? null });
  $: alreadySent = sentSignature !== null && sentSignature === signature;
  $: blocked = !consent || sending || alreadySent;

  async function handleSend() {
    if (honeypot || blocked) return;
    errors = {};

    if (!email) errors.email = 'Podaj adres e-mail, żebyśmy mogli odpowiedzieć.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ten adres e-mail wygląda na niepełny.';
    if (!content.trim()) errors.content = 'Napisz, o co chcesz zapytać.';
    if (Object.keys(errors).length) {
      // Focus the first invalid field so its error is read out.
      await tick();
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const payload = signature;
    try {
      sending = true;
      const prefix = product ? `# Kod: ${product.code}\n\n` : '';
      await api.items('questions').createOne({
        email,
        phone,
        name,
        content: prefix + content.trim(),
        from_product: source === 'product',
        from_contact: source === 'contact',
      });
      sentSignature = payload;
    } catch (e) {
      errors = { form: `Nie udało się wysłać wiadomości: ${e.message}` };
    } finally {
      sending = false;
    }
  }
</script>

<form class="qf" bind:this={form} on:submit|preventDefault={handleSend} novalidate>
  {#if product}
    <p class="qf__about">
      Pytasz o <strong>{product.name}</strong> <span class="code">{product.code}</span>.
    </p>
  {/if}

  <div class="qf__grid">
    <label class="f">
      <span class="f__label">E-mail <span class="req" aria-hidden="true">*</span></span>
      <input
        class="field"
        type="email"
        bind:value={email}
        autocomplete="email"
        aria-required="true"
        aria-invalid={errors.email ? 'true' : undefined}
        aria-describedby={errors.email ? 'qf-email' : undefined}
        class:invalid={errors.email} />
      {#if errors.email}<span class="f__err" id="qf-email">{errors.email}</span>{/if}
    </label>

    <label class="f">
      <span class="f__label">Telefon</span>
      <input class="field" type="tel" bind:value={phone} autocomplete="tel" />
    </label>

    <label class="f f--wide">
      <span class="f__label">Imię i nazwisko</span>
      <input class="field" type="text" bind:value={name} autocomplete="name" />
    </label>

    <label class="f f--wide">
      <span class="f__label">Wiadomość <span class="req" aria-hidden="true">*</span></span>
      <textarea
        class="field"
        rows="5"
        bind:value={content}
        aria-required="true"
        placeholder="Np. Potrzebuję 250 sztuk z nadrukiem logo w dwóch kolorach. Jaki byłby czas realizacji i cena?"
        aria-invalid={errors.content ? 'true' : undefined}
        aria-describedby={errors.content ? 'qf-content' : undefined}
        class:invalid={errors.content}></textarea>
      {#if errors.content}<span class="f__err" id="qf-content">{errors.content}</span>{/if}
    </label>
  </div>

  <!-- Hidden from people, tempting to bots. -->
  <label class="qf__hp" aria-hidden="true" tabindex="-1">
    Nie wypełniaj
    <input type="text" bind:value={honeypot} tabindex="-1" autocomplete="off" />
  </label>

  <label class="qf__consent">
    <input type="checkbox" bind:checked={consent} />
    <span>
      Zapoznałem się z <a href="/obowiazek-informacyjny">obowiązkiem informacyjnym</a> i
      <a href="/polityka-prywatnosci">polityką prywatności</a>.
    </span>
  </label>

  {#if errors.form}
    <p class="qf__error" role="alert">{errors.form}</p>
  {/if}

  <div class="qf__send">
    <button class="btn btn--orange" type="submit" disabled={blocked}>
      {#if sending}
        <span class="qf__spin" aria-hidden="true"></span> Wysyłanie…
      {:else if alreadySent}
        Wysłano
      {:else}
        Wyślij zapytanie
      {/if}
    </button>

    {#if alreadySent}
      <p class="qf__note qf__note--ok" role="status">Dziękujemy, przyjęliśmy wiadomość!</p>
    {:else if !consent}
      <p class="qf__note">Zaznacz zgodę, żeby wysłać.</p>
    {/if}
  </div>
</form>

<style>
  .qf {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }

  .qf__about {
    color: var(--ink-500);
    font-size: var(--fs-sm);
  }
  .qf__about strong {
    color: var(--ink);
  }

  .qf__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sp-4);
  }

  .f {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    min-width: 0;
  }
  .f__label {
    font-size: var(--fs-sm);
    font-weight: 700;
  }
  .req {
    color: var(--red);
  }
  textarea.field {
    resize: vertical;
    min-height: 7rem;
  }
  .invalid {
    border-color: var(--red);
    background-color: var(--red-tint);
  }
  .f__err {
    color: var(--red-deep);
    font-size: var(--fs-xs);
  }

  .qf__hp {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  /* Tapping the label toggles the box; don't select its text. */
  .qf__consent {
    -webkit-user-select: none;
    user-select: none;
    display: flex;
    align-items: flex-start;
    gap: var(--sp-2);
    color: var(--ink-500);
    font-size: var(--fs-sm);
    cursor: pointer;
  }
  .qf__consent input {
    flex: none;
    width: 1.125rem;
    height: 1.125rem;
    margin: 0.15em 0 0;
    cursor: pointer;
  }

  .qf__error {
    padding: var(--sp-3);
    background-color: var(--red-tint);
    color: var(--red-deep);
    font-size: var(--fs-sm);
    font-weight: 600;
  }

  .qf__send {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-3);
  }
  .qf__note {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }
  .qf__note--ok {
    max-width: 34ch;
    color: var(--green);
    font-weight: 600;
  }

  .qf__spin {
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: qf-spin 700ms linear infinite;
  }
  @keyframes qf-spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (min-width: 35rem) {
    .qf__grid {
      grid-template-columns: 1fr 1fr;
    }
    .f--wide {
      grid-column: 1 / -1;
    }
  }
</style>
