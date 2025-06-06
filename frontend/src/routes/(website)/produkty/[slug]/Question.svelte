<script>
  import api from '$/api';
  import Icon from '$c/Icon.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';

  export let product;

  let email;
  let phone;
  let name;
  let content = ''; // `Dzień dobry, czy "${product.name}" wciąż jest dostępny?\nPozdrawiam`;
  let fileInput;

  let consent = false;
  let sending = false;
  let sent = false;
  let errors = {};

  async function sendFile() {
    const files = fileInput.files;
    if (files.length) {
      const form = new FormData();
      form.append('file', files[0]);
      return await api.files.createOne(form);
    }
    return null;
  }

  async function handleSend() {
    sent = false;
    errors = {};

    // expected errors
    if (!email) errors.email = 'Email jest wymagany';
    if (!content) errors.content = 'Treść wiadomości jest wymagana';
    if (Object.keys(errors).length) return;

    try {
      // upload
      sending = true;
      const info = `# Kod: ${product.code}\n\n`;
      const question = { email, phone, name, content: info + content.trim() };
      // const file = await sendFile();
      // if (file) question.file = file.id;
      await api.items('questions').createOne(question);
      sending = false;
      sent = true;
    } catch (e) {
      // unexpected errors
      errors.form = `Wystąpił błąd: ${e.message}`;
    }
  }
</script>

<form>
  <div class="content">
    <div class="content__column">
      <label>
        <span>Email<span class="red">*</span></span>
        <input type="email" bind:value={email} class:error={errors?.email} />
        {#if errors?.email}
          <span class="input-error">{errors.email}</span>
        {/if}
      </label>
      <label>
        <span>Telefon</span>
        <input type="phone" bind:value={phone} />
      </label>
      <label>
        <span>Imię i nazwisko</span>
        <input type="text" bind:value={name} />
      </label>
    </div>

    <div class="content__column">
      <label>
        <span>Wiadomość<span class="red">*</span></span>
        <textarea rows="8" bind:value={content} class:error={errors?.content} />
        {#if errors?.content}
          <span class="input-error">{errors.content}</span>
        {/if}
      </label>
      <!-- <label>
        <span>Załącz plik</span>
        <input type="file" bind:this={fileInput} />
        </label> -->
    </div>
  </div>

  <label class="fake">
    <span>Fake</span>
    <input type="text" />
  </label>

  <div class="send-wrapper">
    <div class="send">
      <button type="submit" disabled={!consent} on:click|preventDefault={handleSend}>
        {#if consent}
          <HoverCircle color="var(--main-4)" />
        {/if}
        <div>
          <Icon name="questions" light height="1.5rem" />
          Wyślij
        </div>
      </button>
    </div>

    <div class="consent-and-feedback">
      <label class="consent">
        <input type="checkbox" bind:checked={consent} />
        <small>
          Zapoznałem się z <a href="/obowiazek-informacyjny">obowiązkiem informacyjnym</a> i
          <a href="/polityka-prywatnosci">polityką prywatności</a>.
        </small>
      </label>
      {#if sent}
        <div class="feedback">Wiadomość została wysłana!</div>
      {/if}
      {#if errors?.form}
        <div class="feedback red">{errors.form}</div>
      {/if}
    </div>
  </div>
</form>

<style>
  form {
    border: 2px solid var(--main);
    background-color: var(--white);
    padding: 1rem;
  }

  .content {
    display: flex;
    gap: 1rem;
  }
  .content label {
    display: flex;
    flex-direction: column;
  }
  .content span {
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
  }
  .content span.red {
    color: var(--main);
  }
  .content input,
  .content textarea {
    outline: none;
    border: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    font-size: 1rem;
  }
  .content input {
    width: 30ch;
  }
  .content textarea {
    width: 40ch;
  }
  .content input.error,
  .content textarea.error {
    background-color: var(--main-0);
  }
  .content .input-error {
    font-size: small;
    margin-top: 0.25rem;
    margin-left: 0.5rem;
    color: var(--main);
  }
  .content input:focus,
  .content textarea:focus {
    border-color: var(--main-3);
  }
  .content input[type='file'] {
    padding: 0;
    border-radius: 0;
    border: none;
  }

  .send-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .send {
    display: flex;
  }
  .send button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    border: none;
    background-color: var(--main);
  }
  .send button:disabled {
    cursor: not-allowed;
    background-color: var(--grey-dark);
  }
  .send button > div {
    z-index: 1;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: var(--white);
    font-size: 1rem;
  }
  .consent-and-feedback {
    display: flex;
    flex-direction: column;
  }
  .consent {
    display: flex;
    gap: 0.25rem;
  }
  .consent input {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
  }
  .consent small {
    position: relative;
    top: 0.1rem;
    white-space: nowrap;
  }
  .feedback {
    margin-left: 0.2rem;
    font-weight: bold;
  }

  .fake {
    /* fake input to throw off bots */
    display: none;
  }
</style>
