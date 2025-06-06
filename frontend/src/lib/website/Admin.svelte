<script>
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';
  import { baseUrl } from '$/api';
  import { me, logout } from '$/auth';

  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';

  import { layout, editing as layoutEditing, modified as layoutModified } from '#/layout/store';
  import { save as layoutSave } from '#/layout/utils';

  const iconSize = '70%';

  $: pathname = $page.url.pathname;

  // more specific pathnames go first (since '/produkty' also matches '/')
  $: edits = [
    {
      pathname: '/produkty',
      label: 'Edytuj produkt',
      icon: 'products',
      url: '/admin/produkty/' + pathname.split('/')[2]
    },
    {
      pathname: '/kategorie',
      label: 'Edytuj kategorię',
      icon: 'categories',
      url: '/admin/kategorie/' + pathname.split('/')[2]
    },
    {
      pathname: '/',
      label: 'Edytuj układ',
      icon: 'grid',
      data: layout,
      editing: layoutEditing,
      modified: layoutModified,
      save: layoutSave
    }
  ];

  $: edit = edits.find(e => pathname.startsWith(e.pathname));

  // stores
  $: data = edit?.data;
  $: editing = edit?.editing;
  $: modified = edit?.modified;

  async function handleToggle() {
    $editing = !$editing;
    if ($modified && edit?.save) {
      await edit.save($data);
      $modified = false;
    }
    edit = edit;
  }
</script>

<div class="admin">
  {#if edit}
    <div class="strip" transition:slide={{ duration: 200 }}>
      {#if edit?.url}
        <a href={edit.url} rel="noreferrer" target="_blank">
          <HoverCircle color="var(--main-2)" />
          <Tooltip>{edit.label}</Tooltip>
          <div class="content">
            <Icon name={edit.icon} width={iconSize} />
          </div>
        </a>
      {:else if $editing !== undefined}
        <button on:click={handleToggle}>
          <HoverCircle color="var(--main-2)" />
          <Tooltip>{$editing ? ($modified ? 'Zapisz' : 'Anuluj') : edit.label}</Tooltip>
          <div class="content">
            <Icon name={$editing ? ($modified ? 'save' : 'edit') : edit.icon} width={iconSize} />
          </div>
        </button>
      {/if}
    </div>
  {/if}
  <div class="strip" transition:slide={{ duration: 200 }}>
    <a href="/admin" rel="noreferrer" target="_blank">
      <HoverCircle color="var(--main-2)" />
      <Tooltip>Panel admina</Tooltip>
      <div class="content">
        <Icon name="slide_settings" width={iconSize} />
      </div>
    </a>
    <button class="logout" on:click={logout}>
      <HoverCircle color="var(--main-2)" />
      <Tooltip>Wyloguj</Tooltip>
      <div class="content">
        <Icon name="logout" width={iconSize} />
      </div>
    </button>
    <div class="avatar">
      <Tooltip>{$me.first_name} {$me.last_name}</Tooltip>
      <img src="{baseUrl}/assets/{$me.avatar}" alt="avatar" />
    </div>
  </div>
</div>

<style>
  .admin {
    --margin: 0.5rem;
    z-index: 1;
    position: fixed;
    bottom: var(--margin);
    left: var(--margin);
    display: flex;
    flex-direction: column;
    gap: var(--margin);
  }

  .strip {
    --padding: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    border-radius: 100px;
    padding: var(--padding);
    background-color: var(--main-1);
  }
  .strip > * {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 100px;
    border: none;
    padding: 0;
    width: 2.5rem;
    aspect-ratio: 1 / 1;
    background-color: var(--main-1);
  }

  .content {
    z-index: 1;
    display: grid;
    place-items: center;
  }
  .avatar {
    cursor: help;
    padding: 0;
  }

  img {
    z-index: 1;
    border-radius: 100px;
    width: 100%;
  }
</style>
