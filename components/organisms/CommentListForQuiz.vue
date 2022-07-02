<template>
  <div class="mt-4" v-if="comments.length > 0">
    <h3 class="quiz-show__subtitle">コメント({{comments.length}}件)</h3>
    <b-card v-for="(comment, index) in comments" :header="`${comment.title}`" :key="index" class="mb-3">
      <p class="quiz-show__text" v-html="$md.render(comment.content || '')"></p>
      <ActionList :firestoreDoc="comment.doc" :actions="masterMap.actionsMap.comment" :creator="quizCreator"></ActionList>
      <UserAndTime :user="comment.creator" :time="comment.createdAt"></UserAndTime>
    </b-card>
  </div>
</template>
<script>
import firebase from '~/plugins/firebase'
import ActionList from "~/components/organisms/ActionList";
import UserAndTime from "~/components/molecules/UserAndTime"
import { mapState, mapGetters } from 'vuex'

export default {
  name: "comment-list",
  components: {
    ActionList,UserAndTime
  },
  props:{
    firestoreCommentsQueryBase: {
      type: Object,
      required: true
    },
    quizCreator: {
      type: Object,
      required: false
    }
  },
  data(){
    return {
      comments: [],
      displayedLastQuiz: null,
    }
  },
  computed: {
    ...mapState('master', ['masterMap']),
    ...mapGetters('master', ['getValue']),
    COMMENT_COUNT_PER_PAGE(){
      //Readonlyの変数のため、dataに入れずにcomputedにしている
      return process.env.COMMENT_COUNT_PER_PAGE
    }
  },
  async mounted(){
    console.log(this.firestoreCommentsQueryBase)

    // TODO: 同様なクエリが何度も使用される場合は、集約を検討する
    let firestoreCommentsQuery = this.firestoreCommentsQueryBase.limit(this.COMMENT_COUNT_PER_PAGE)

    firestoreCommentsQuery.orderBy('createdAt')
      .onSnapshot(snapshot => {
        this.comments = snapshot.docs.map(doc => {
          const data = doc.data();
          this.$set(data, 'doc', doc.ref);
          return this.replaceReferenceContent(data, 'creatorRef', 'creator')
          })
        console.log('Quiz Comments updated', this.comments)
      })

  },
  methods: {
    replaceReferenceContent(content, referenceName, replaceName){
      if(content[referenceName] && typeof content[referenceName].get == 'function') {
        content[referenceName].get().then(doc => {
          this.$set(content, replaceName, doc.data());
        })
      }
      return content
    },
  }
}
</script>

<style scoped>

.quiz-show__text >>> img {
  max-width: 100%;
  height: auto;
}

</style>
