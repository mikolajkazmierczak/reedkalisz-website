<script>
  import { header } from '@/stores';
  import Icon from '$c/Icon.svelte';

  $header = { title: 'Dashboard', icon: 'dashboard' };

  const buttons = [
    {
      title: 'Produkty',
      buttons: [
        { title: 'Produkty', icon: 'products', href: '/admin/produkty' },
        { title: 'Kolory', icon: 'colors', href: '/admin/kolory' },
        { title: 'Kategorie', icon: 'categories', href: '/admin/kategorie' },
        { title: 'Informacje handlowe', icon: 'commercial_details', href: '/admin/informacje-handlowe' },
        { title: 'Kalkulacje', icon: 'calculator', href: '/admin/kalkulacje' }
      ]
    },
    {
      title: 'Zawartość',
      buttons: [
        { title: 'Menu', icon: 'menu', href: '/admin/menu' },
        { title: 'Strony', icon: 'pages', href: '/admin/strony' },
        { title: 'Fragmenty', icon: 'fragments', href: '/admin/fragmenty' }
      ]
    },
    {
      title: 'Inne',
      buttons: [
        { title: 'Biblioteka', icon: 'library', href: '/admin/biblioteka' },
        { title: 'Zapytania', icon: 'questions', href: '/admin/zapytania' },
        { title: 'API', icon: 'api', href: '/admin/api' }
      ]
    }
  ];
</script>

<svelte:head>
  <title>Admin | REED Kalisz</title>
</svelte:head>

{#each buttons as button}
  <div class="section">
    <h2>{button.title}</h2>
    <div class="buttons">
      {#each button.buttons as { title, icon, href }}
        <a {href}>
          <div class="icon">
            <Icon fill name={icon} light />
          </div>
          {title}
        </a>
      {/each}
    </div>
  </div>
{/each}

<style>
  .section {
    margin: 2rem 2.5rem;
  }
  h2 {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }
  .buttons {
    display: flex;
    gap: 1.5rem;
  }
  a {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem 1rem;
    text-decoration: none;
    border-radius: var(--border-radius);
    width: 20ch;
    color: var(--light);
    text-align: center;
    background-color: var(--primary);
    transition: background-color 100ms ease;
  }
  a:hover {
    background-color: var(--primary-light);
  }
  .icon {
    margin-bottom: 1rem;
    width: 50px;
  }
</style>
