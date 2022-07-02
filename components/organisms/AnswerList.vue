<template>
  <div class="mt-4" v-if="answers.length > 0">
     <b-card v-for="(answer, index) in answers"  :key="index" class="mb-3">
        <b-link  :to="genShowPath(answer.quizId)" :key="index" class="content-link">
          <h2 class="quiz-show__text quiz-title">{{answer.quiztitle}}</h2>
          <p class="quiz-show__text" v-html="$md.render(answer.answerBody || '')"></p>
          <p class="quiz-show__text" v-html="$md.render(answer.explanation || '')"></p>
        </b-link>
        <ActionList :firestoreDoc="answer.doc" :actions="masterMap.actionsMap.answer" :creator="answer.creatorRef"></ActionList>  
        <UserAndTime :user="answer.creator" :time="answer.createdAt"></UserAndTime>
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
  name: "answer-list",
  components: {
    ActionList,InfiniteLoading,UserAndTime
  },
  props:{
    firestoreAnswerQueryBase: {
      type: Object,
      required: true
    }
  },
  data(){
    return {
      answers: [],
      displayedLastQuiz: null,
      displayedLastAnswer: null,
      firestoreAnswersQuery: null
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
  watch: {
    firestoreAnswerQueryBase: async function(newData,oldData){
      this.firestoreAnswersQuery = this.firestoreAnswerQueryBase.orderBy('createdAt')
      await this.getNextAnswer()
    }
  },
  methods: {
    genShowPath(id) {
      return `/quizzes/${id}`
    },
    async getNextAnswer(){
      const db = firebase.firestore()
      let showingFirestoreAnswersQuery
      if(this.displayedLastAnswer === null){
        // TODO: 同様なクエリが何度も使用される場合は、集約を検討する
        showingFirestoreAnswersQuery = this.firestoreAnswersQuery.limit(this.COMMENT_COUNT_PER_PAGE)
      }else{
        showingFirestoreAnswersQuery = this.firestoreAnswersQuery.startAfter(this.displayedLastAnswer).limit(this.COMMENT_COUNT_PER_PAGE)
      }

      let addAnswers,getAnswerNum
      let deletedQuizList = []

      //解答を取得
      addAnswers = await showingFirestoreAnswersQuery
        .get()
        .then((docs) =>{
                const answers = docs.docs.map((doc) =>{
                  let data = doc.data();
                  //quizIdを取得
                  data["quizId"] = doc.ref.parent.parent.id 
                  this.$set(data, 'doc', doc.ref);
                  return this.replaceReferenceContent(data, 'creatorRef', 'creator')
                })
                return answers
              })

      getAnswerNum = addAnswers.length
      if(getAnswerNum == 0) return 0

      //クイズのタイトルを追加
      const result = await Promise.all(addAnswers.map(async (answer) =>{
        const getFirestoreQuizTitle = await  db.collection('quizzes').doc(answer.quizId)
                .get()
                .then((doc) =>{
                  const firestoreQuiz = doc.data()
                  answer['quiztitle'] = firestoreQuiz.title;
                  if(firestoreQuiz.deletedAt != null){
                    deletedQuizList.push(answer);
                  }
        })
      }))

      //Quizが削除(deletedAt)されているデータを除く
      addAnswers = addAnswers.filter(function(tmp){
        return ! deletedQuizList.includes(tmp) 
      })

      this.answers =  this.answers.concat(addAnswers);  
      this.displayedLastAnswer = this.answers[this.answers.length -1].createdAt
      //取得したクイズのすべてが削除される場合無限ループになるので回避
      if(deletedQuizList.length == getAnswerNum){
        this.displayedLastAnswer = deletedQuizList[deletedQuizList.length -1].createdAt  
      }
      console.log('Quiz Answers updated', this.answers)  
      return getAnswerNum;       
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
      const loadedAnswersCount = await this.getNextAnswer()
      loadedAnswersCount === 0 ? $state.complete() : $state.loaded()
    }
  }
}
</script>

<style scoped>
.quiz-show__text >>> img {
  max-width: 100%;
  height: auto;
}

.quiz-show__text {
  color: #000000;
}

.quiz-title{
  font-size: 20px;
  font-weight: 700;
}

</style>
