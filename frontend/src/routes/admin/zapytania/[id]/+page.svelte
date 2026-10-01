<script>
  import Question from '@/editors/question/Question.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { id } = data;
</script>

<Question {id} />
