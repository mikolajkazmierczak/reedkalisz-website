<script>
  export let datetime;
  let date;
  let time;
  $: if (datetime) {
    const splt = datetime.split('T');
    date = splt[0].replaceAll('-', '.');
    time = splt[1];
  }
</script>

{#if datetime}
  <span>{date}&nbsp;|&nbsp;{time}</span>
{/if}
