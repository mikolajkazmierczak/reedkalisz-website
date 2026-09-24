<script>
  import { tick } from 'svelte';
  import api from '$/api';

  /** The product asked about, prefixed onto the message; without one it is a contact-page inquiry. */
  export let code = null;

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
  $: signature = JSON.stringify({ email, phone, name, content: content.trim(), code });
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
      const prefix = code ? `# Kod: ${code}\n\n` : '';
      await api.items('questions').createOne({
        email,
        phone,
        name,
        content: prefix + content.trim(),
        from_product: !!code,
        from_contact: !code,
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
  /* the orange contact flow; errors stay red */
  .qf {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    --focus: var(--orange);
    accent-color: var(--orange);
    caret-color: var(--orange);
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
    color: var(--orange-deep);
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

  /* The whole row toggles the box; its text isn't selected on tap. */
  .qf__consent {
    -webkit-user-select: none;
    user-select: none;
    display: flex;
    align-items: flex-start;
    gap: var(--sp-3);
    margin: calc(var(--sp-2) * -1);
    padding: var(--sp-2);
    color: var(--ink-500);
    font-size: var(--fs-sm);
    line-height: 1.5;
    cursor: pointer;
  }
  .qf__consent a {
    color: var(--orange-deep);
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .qf__consent a:hover {
    color: var(--orange);
  }
  /* A squircle like the fields, centred on the first line of text. */
  .qf__consent input {
    flex: none;
    appearance: none;
    display: grid;
    place-items: center;
    width: 1.625rem;
    height: 1.625rem;
    margin: calc((1.5em - 1.625rem) / 2) 0 0;
    border: 1px solid var(--ink-300);
    border-radius: 0.625rem;
    corner-shape: squircle;
    background-color: var(--surface);
    cursor: pointer;
    transition:
      background-color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
  }
  .qf__consent input::after {
    content: '';
    width: 1.0625rem;
    height: 1.0625rem;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8.5l3.25 3.25L13 5' fill='none' stroke='%23fff' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / contain no-repeat;
    transform: scale(0.4);
    opacity: 0;
    transition:
      transform var(--dur-fast) var(--ease),
      opacity var(--dur-fast) var(--ease);
  }
  .qf__consent:hover input {
    border-color: var(--orange);
  }
  .qf__consent input:checked {
    border-color: var(--orange);
    background-color: var(--orange);
  }
  .qf__consent input:checked::after {
    transform: none;
    opacity: 1;
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
