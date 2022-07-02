<template>
  <div class="mt-4" v-if="comments.length > 0">
    <b-card v-for="(comment, index) in comments"  :key="index" class="mb-3">
      <b-link  :to="genShowPath(comment.quizId)" :key="index" class="content-link">
        <h2 class="quiz-show__text quiz-title">{{comment.quiztitle}}</h2>
        <p class="quiz-show__text" v-html="$md.render(comment.content || '')"></p>
      </b-link>
      <ActionList :firestoreDoc="comment.doc" :actions="masterMap.actionsMap.comment" :creator="quizCreator"></ActionList>
      <UserAndTime :user="comment.creator" :time="comment.createdAt"></UserAndTime>
    </b-card>
    <infinite-loading @infinite="infiniteHandler"></infinite-loading>
  </div>
</template>
<script>
import firebase from '~/plugins/firebase'
import ActionList from "~/components/organisms/ActionList";
import { mapState, mapGetters } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading' 
import UserAndTime from "~/components/molecules/UserAndTime"

export default {
  name: "comment-list",
  components: {
    ActionList,InfiniteLoading,UserAndTime
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
      displayedLastComment: null,
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
  },
  watch: {
    firestoreCommentsQueryBase: async function(newData,oldData){
      this.firestoreCommentsQuery = this.firestoreCommentsQueryBase.orderBy('createdAt')
      await this.getNextComment()
    }
  },
  methods: {
    genShowPath(id) {
      return `/quizzes/${id}`
    },
    async getNextComment(){
      const db = firebase.firestore()
      let showingFirestoreCommentsQuery

      if(this.displayedLastComment === null){
        // TODO: 同様なクエリが何度も使用される場合は、集約を検討する
        showingFirestoreCommentsQuery = this.firestoreCommentsQuery.limit(this.COMMENT_COUNT_PER_PAGE)
      }else{
        showingFirestoreCommentsQuery = this.firestoreCommentsQuery.startAfter(this.displayedLastComment).limit(this.COMMENT_COUNT_PER_PAGE)
      }
      let addComments,getCommentNum
      let deletedQuizList = []

      //コメントを件取得
      addComments = await showingFirestoreCommentsQuery
        .get()
        .then((docs) =>{
                const comment = docs.docs.map((doc) =>{
                  let data = doc.data();
                  this.$set(data, 'doc', doc.ref);
                  return this.replaceReferenceContent(data, 'creatorRef', 'creator')
                })
                return comment
              })
      
      getCommentNum = addComments.length
      if(getCommentNum === 0) return 0
      
      //クイズのタイトルを追加
      const result = await Promise.all(addComments.map(async (comment) =>{
        const getFirestoreQuizTitle = await  db.collection('quizzes').doc(comment.quizId)
                .get()
                .then((doc) =>{
                  const firestoreQuiz = doc.data()
                  if(firestoreQuiz.deletedAt != null){
                    deletedQuizList.push(comment);
                  }
                  comment['quiztitle'] = firestoreQuiz.title;
                }) 
      }))
      
      //Quizが削除(deletedAt)されているデータを除く
      addComments = addComments.filter(function(tmp){
        return ! deletedQuizList.includes(tmp) 
      })

      this.comments =  this.comments.concat(addComments);
      this.displayedLastComment = this.comments[this.comments.length -1].createdAt
      if(deletedQuizList.length == getCommentNum){
        this.displayedLastComment = this.deletedQuizList[deletedQuizList.length -1].createdAt
      } 
      console.log('Quiz Comments updated', this.comments)
      return getCommentNum;
    },
    replaceReferenceContent(content, referenceName, replaceName){
      if(content[referenceName] && typeof content[referenceName].get == 'function') {
        content[referenceName].get().then(doc => {
          this.$set(content, replaceName, doc.data());
        })
      }
      return content
    },
    async infiniteHandler($state){
      const loadedQuizCount = await this.getNextComment()
      loadedQuizCount === 0 ? $state.complete() : $state.loaded()
    }
  }
}
</script>

<style scoped>

.quiz-show__text >>> img {
  max-width: 100%;
  height: auto;
}

.quiz-show__text{
  color: #000000;
}

.quiz-title{
  font-size: 20px;
  font-weight: 700;
}

</style>
