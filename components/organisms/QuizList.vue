<template>
<div>
  <b-link v-for="(q, index) in quizzes" :to="genShowPath(q.id)" :key="index" class="content-link">
    <b-card class="quiz-content mb-3">
      <b-card-text>
        <span class="mr-3 quiz-content__tag" v-for="(val) in q.tags">#{{val.value}}</span>
        <h2 class="card-title quiz-content__title">{{q.title}}</h2>
        <span class="quiztype-label">{{getValue('quizTypes', q.type)}}</span>

        <div class="float-right">
          <span class="quiz-content__useraction">
            <b-icon icon="chat-fill" class="useraction-icon"></b-icon>
            {{ q.comments.length}}
          </span>
          <span class="quiz-content__useraction">
            <b-icon icon="pencil" class="useraction-icon"></b-icon>
            <span>{{ q.answers.length}}</span>
          </span>
          <span class="quiz-content__useraction">
            <b-icon icon="heart-fill" class="useraction-icon"></b-icon>
            {{ q.actions.length}}
          </span>
          <span class="quiz-content__useraction">
            <b-icon icon="flag" class="useraction-icon"></b-icon>
            {{ q.surrenders.length}}
          </span>
        </div>

        <div v-if="q.answerOpenedAt && $moment(q.answerOpenedAt.toDate()) > $moment() " class="mt-2">
          <span class="icon-color">
            <b-icon icon="unlock-fill"></b-icon>
          </span>
          解答公開日：{{q.answerOpenedAt.seconds | format-date-from-unixtime}}
        </div>

        <div class="quiz-content__text" v-html="$md.render(q.content || '')"></div>
        <nuxt-link :to="`/users/${q.creator.uid}`" class="quiz-content__user" v-if="q.creator">
          <img :src="q.creator.photoURL | userIcon"><span>{{ q.creator.displayName }}</span>
        </nuxt-link>
        <span class="quiz-content__create">{{ (q.createdAt && q.createdAt.seconds) | format-datetime-from-unixtime }}</span>
      </b-card-text>
    </b-card>

    <hr class="content-border">
  </b-link>

  <infinite-loading @infinite="infiniteHandler"></infinite-loading>
</div>
</template>
<script>
import firebase from '~/plugins/firebase'
import { mapState, mapGetters } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: "quiz-list",
  components: {
    InfiniteLoading
  },
  props:{
    firestoreQuizzesQueryBase: {
      type: Object,
      required: true
    }
  },
  data(){
    return {
      quizzes: [],
      displayedLastQuiz: null,
    }
  },
  head: {
  },
  mutations: { },
  computed: {
    ...mapState('master', ['masterMap']),
    ...mapGetters('master', ['getValue']),
    QUIZ_COUNT_PER_PAGE(){
      //Readonlyの変数のため、dataに入れずにcomputedにしている
      return process.env.QUIZ_COUNT_PER_PAGE
    }
  },
  async mounted(){
  },
  methods: {
    genShowPath(id) {
      return `/quizzes/${id}`
    },
    async getNextQuizzes(){
      const db = firebase.firestore()

      // TODO: 同様なクエリが何度も使用される場合は、集約を検討する
      let firestoreQuizzesQuery = this.firestoreQuizzesQueryBase.limit(this.QUIZ_COUNT_PER_PAGE)

      if(this.displayedLastQuiz != null){
        firestoreQuizzesQuery = firestoreQuizzesQuery.startAfter(this.displayedLastQuiz)
      }

      const loadedQuizzes = await firestoreQuizzesQuery.get()
      const loadedQuizzesContent = loadedQuizzes.docs.map(doc => {
        const data = doc.data()
        data.id = doc.id
        data.comments = []
        data.answers = []
        data.surrenders = []
        data.actions = []
        db.collection('quizzes').doc(data.id).collection('comments').orderBy('createdAt')
        .onSnapshot(snapshot => {
          data.comments = snapshot.docs.map( doc => doc.data())
        })
        db.collection('quizzes').doc(data.id).collection('answers').orderBy('createdAt')
        .onSnapshot(snapshot => {
          data.answers = snapshot.docs.map( doc => doc.data())
        })
        db.collection('quizzes').doc(data.id).collection('surrenders').orderBy('createdAt')
        .onSnapshot(snapshot => {
          data.surrenders = snapshot.docs.map( doc => doc.data())
        })
        db.collection('quizzes').doc(data.id).collection('actions').orderBy('createdAt')
        .onSnapshot(snapshot => {
          // TODO: 一旦いいねしか使ってないのでいいねのみ抽出.要リファクタ.
          data.actions = snapshot.docs.filter( doc => doc.data().type == 'like')
        })

        return this.replaceReferenceContent(data, 'creatorRef', 'creator')
      })
      console.log(loadedQuizzesContent)
      this.quizzes = this.quizzes.concat(loadedQuizzesContent)

      if(loadedQuizzes.docs.length > 0 ){
        this.displayedLastQuiz = loadedQuizzes.docs[loadedQuizzes.docs.length - 1]
      }

      return loadedQuizzes.size
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
      const loadedQuizCount = await this.getNextQuizzes()
      loadedQuizCount === 0 ? $state.complete() : $state.loaded()
    }
  }
}
</script>

<style scoped>
.quiz-content >>> .card-body{
  overflow: hidden;
  padding: 0 5px;
  text-overflow: ellipsis;
}
.quiz-content >>> img {
  max-width: 100%;
  height: auto;
}
</style>
