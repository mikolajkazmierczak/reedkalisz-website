<script>
  import Question from '@/editors/question/Question.svelte';

  export let data;
  let { id } = data;
</script>

<Question {id} />
