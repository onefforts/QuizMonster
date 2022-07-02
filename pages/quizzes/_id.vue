<template>
  <div>
    <quiz-detail :quiz-id="$route.params.id" />
 </div>
</template>

<script>
import QuizDetail from "../../components/organisms/QuizDetail";

export default {
  name: "quizzes-show-by-id",
  components: {
    QuizDetail
  },
  middleware: 'authenticated',
  meta: {
    authenticated: { isNoRedirect: true }
  },
  data(){
    return {}
  },
  async mounted(){},
}
</script>

<style scoped>

</style>
