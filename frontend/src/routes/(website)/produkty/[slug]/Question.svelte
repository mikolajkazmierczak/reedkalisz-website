<script>
  import api from '$/api';
  import Icon from '$c/Icon.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';

  export let product;

  let email;
  let phone;
  let name;
  let content = `Dzień dobry, czy "${product.name}" wciąż jest dostępny?\nPozdrawiam`;
  let fileInput;

  let saving = false;
  let sent = false;
  let errors = {};

  async function getFile() {
    const files = fileInput.files;
    if (files.length) {
      const form = new FormData();
      form.append('file', files[0]);
      console.log(form);
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
      saving = true;
      const question = { email, phone, name, content };
      const file = await getFile();
      if (file) question.file = file.id;
      await api.items('questions').createOne(question);
      saving = false;
      sent = true;
    } catch (e) {
      // unexpected errors
      errors.form = `Wystąpił błąd: ${e.message}`;
      console.log(e);
    }
  }
</script>

<form>
  <label>
    <span class="first">Email<b>*</b></span>
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

  <label>
    <span>Wiadomość<b>*</b></span>
    <textarea rows="8" bind:value={content} class:error={errors?.content} />
    {#if errors?.content}
      <span class="input-error">{errors.content}</span>
    {/if}
  </label>
  <label>
    <span>Załącz plik</span>
    <input type="file" bind:this={fileInput} />
  </label>

  <label class="fake">
    <span>Info</span>
    <input type="text" />
  </label>

  <button type="submit" on:click|preventDefault={handleSend}>
    <HoverCircle color="var(--main-4)" />
    <div>
      <div class="icon"><Icon name="questions" light /></div>
      Wyślij
    </div>
  </button>

  {#if sent}
    <div class="form-success">Wiadomość została wysłana!</div>
  {/if}
  {#if errors?.form}
    <div class="form-error">{errors.form}</div>
  {/if}
</form>

<style>
  label {
    display: flex;
    flex-direction: column;
  }
  span {
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
  }
  input,
  textarea {
    outline: none;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    font-size: 1rem;
  }
  input {
    width: 30ch;
  }
  textarea {
    width: 40ch;
  }
  input.error,
  textarea.error {
    background-color: var(--main-0);
  }
  .input-error {
    font-size: small;
    margin-top: 0.25rem;
    margin-left: 0.5rem;
    color: var(--main);
  }
  input:focus,
  textarea:focus {
    border-color: var(--main-3);
  }
  input[type='file'] {
    padding: 0;
    border-radius: 0;
    border: none;
  }

  .fake {
    display: none;
  }

  button {
    overflow: hidden;
    position: relative;
    cursor: pointer;
    margin-top: 1.5rem;
    border-radius: 10px;
    border: none;
    padding: 0;
    background-color: var(--main);
  }
  button > div {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    color: var(--light);
    font-size: 1rem;
  }
  button .icon {
    margin-right: 0.5rem;
    width: 1.5rem;
  }

  .form-success,
  .form-error {
    font-size: small;
    margin-top: 0.5rem;
  }
  .form-success {
    font-weight: bold;
  }
  .form-error {
    color: var(--main);
  }
</style>
