<template>
  <!-- TODO: QuizListとtemplate の部分は被っているので、統合を検討する -->
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
          <span class="quiz-content__create float-right">{{ (q.createdAt && q.createdAt.seconds) | format-datetime-from-unixtime }}</span>
        </b-card-text>
      </b-card>

      <hr class="content-border">
    </b-link>

    <infinite-loading ref="infinite-loading" @infinite="infiniteHandler"></infinite-loading>
  </div>
</template>
<script>
import firebase from '~/plugins/firebase'
import { mapState, mapGetters } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import algoliasearch from 'algoliasearch'

const algoliaClient = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_SEARCH_KEY)
const searchIindex = algoliaClient.initIndex(`${process.env.DEPLOY_ENV}_quizzes`)

export default {
  name: "quiz-list",
  components: {
    InfiniteLoading
  },
  props:{
    query: {
      type: String,
      default: ''
    }
  },
  data(){
    return {
      quizzes: [],
      displayedLastQuiz: null,
      searchOption: {
        page: -1,
        hitsPerPage: 10
      },
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
  async mounted(){},
  watch: {
    //検索クエリが更新されたら初期化する
    query(){
      this.quizzes = []
      this.searchOption.page = -1
      this.$refs['infinite-loading'].stateChanger.reset()
    }
  },
  methods: {
    genShowPath(id) {
      return `/quizzes/${id}`
    },
    async getNextQuizzes(searchResultHits){
      const db = firebase.firestore()
      await Promise.all(searchResultHits.map(async result => {
        try {
          const doc = await db.collection('quizzes').doc(result.objectID).get()
          const data = doc.data()

          if(data){
            await Promise.all([db.collection('quizzes').doc(result.objectID).collection('comments').orderBy('createdAt')
              .get().then(comments => {
                 data.comments = comments.docs
              }),
            db.collection('quizzes').doc(result.objectID).collection('answers').orderBy('createdAt')
              .get().then(answers => {
                data.answers = answers.docs
              }),
            db.collection('quizzes').doc(result.objectID).collection('surrenders').orderBy('createdAt')
              .get().then(surrenders => {
                data.surrenders = surrenders.docs
              })
            ])
            data.id = result.objectID

            this.quizzes.push(data)
          }
        }catch(e){
          console.log(`get data error: ${e}`)
        }
      }))
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
      this.searchOption.page++
      const searchResult = await searchIindex.search(this.query, this.searchOption)
      await this.getNextQuizzes(searchResult.hits)
      searchResult.hits.length === 0 ? $state.complete() : $state.loaded()
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
