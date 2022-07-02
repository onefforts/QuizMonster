<template>

  <div class="row">
    <div class="col-sm-12 col-lg-8 mx-auto mt-4">
      <h2 class="index-sub-title">クイズを探す</h2>
        <div class="form-group row">
          <div class="col-lg-8">
            <input type="text" class="form-control mb-2" v-model="query" placeholder="検索ワードを入力">
          </div>

          <div class="col-lg-4">
            <button class="btn btn-main" style="margin: 0;" @click="executeSearch" :disabled="!query">
             <b-icon icon="search" class="" style="margin: 0 2px;" ></b-icon>
             検索
            </button>
          </div>
        </div>
    </div>

    <div class="col-sm-12 col-lg-8 mx-auto mt-4 mb-4">
      <h2 class="index-title">新着クイズ</h2>
      <quiz-list :firestoreQuizzesQueryBase="firestoreQuizzesQueryBase"></quiz-list>

    </div>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { mapState, mapGetters } from 'vuex'
import QuizList from "../components/organisms/QuizList"

export default {
  name: "quizzes-index",
  middleware: 'authenticated',
  meta: {
    authenticated: { isNoRedirect: true }
  },
  head() {
    return {
      title: '新着クイズ'
    }
  },
  components:{ QuizList },
  data(){
    return {
      firestoreQuizzesQueryBase: {},
      query: ''
    }
  },
  async mounted(){
    const db = firebase.firestore()
    this.firestoreQuizzesQueryBase = db.collection('quizzes').where('deletedAt', '==', null).orderBy('createdAt', 'desc')

  },
  methods: {
    async executeSearch(){
      this.$router.push(`/quizzes/search?query=${this.query}`)
    }
  }

}
</script>
