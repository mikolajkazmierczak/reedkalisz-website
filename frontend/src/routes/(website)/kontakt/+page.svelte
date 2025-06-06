<script>
  import { marked } from 'marked';

  export let data;
</script>

<div class="wrapper">
  <div class="content">
    <h1 class="title">Kontakt</h1>

    <div class="info">
      {@html marked.parse(data.fragment.content)}
    </div>

    <div class="maps">
      <!-- <iframe
        title="REED Kalisz - Google Maps"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2469.6677393224336!2d18.061981!3d51.757399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ac5b8b44a5da3%3A0x47ae65b30eb92c8b!2sREED%20-%20Piecz%C4%85tki%20-%20Druki%20samokopiuj%C4%85ce%20-%20Naklejki%20-%20Gad%C5%BCety%20reklamowe!5e0!3m2!1sen!2spl!4v1727396986512!5m2!1sen!2spl"
        width="800"
        height="400"
        style="border:0;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts"
      /> -->
      <iframe
        title="REED Kalisz - OpenStreetMap"
        width="800"
        height="400"
        style="border: 0;"
        src="https://www.openstreetmap.org/export/embed.html?bbox=18.06013941764832%2C51.75668907327362%2C18.063679933547977%2C51.75816671026607&amp;layer=mapnik&amp;marker=51.75742789781386%2C18.061909675598145"
        loading="lazy"
      />
      <br />
      <small>
        <a href="https://www.openstreetmap.org/?mlat=51.757428&amp;mlon=18.061910#map=19/51.757428/18.061910">
          Pokaż dużą mapę
        </a>
      </small>
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    margin: 2.5rem 0;
  }
  .content {
    display: flex;
    flex-direction: column;
  }
  .title {
    margin-bottom: 2rem;
  }
  .info {
    display: grid;
    grid-template-columns: auto 60ch;
    gap: 3rem;
    width: 800px;
    margin-bottom: 2rem;
  }
  :global(.info p) {
    margin: 1rem 0;
  }
</style>
