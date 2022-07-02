<template>

  <div class="row">
    <div class="col-sm-12 col-lg-8 mx-auto mt-4">
      <h2 class="index-sub-title"> クイズを探す</h2>
        <div class="form-group row">
          <div class="col-lg-8">
            <input type="text" class="form-control mb-2" v-model="query" placeholder="検索ワードを入力">
          </div>

          <div class="col-lg-4">
            <button class="btn btn-main" style="width:50%;" @click="executeSearch">
             <b-icon icon="search" class="" style="margin: 0 2px;"></b-icon>
             検索
            </button>
          </div>
        </div>
    </div>

    <div class="col-sm-12 col-lg-8 mx-auto mt-4 mb-4">
      <h2 class="index-title"> {{$route.query.query}} の検索結果</h2>
      <search-quiz-list :query="execQuery" />

    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SearchQuizList from "~/components/organisms/SearchQuizList";

export default {
  name: "quizzes-search",
  middleware: 'authenticated',
  meta: {
    authenticated: { isNoRedirect: true }
  },
  head() {
    return {
      title: '検索'
    }
  },
  components:{ SearchQuizList },
  data(){
    return {
      query: this.$route.query.query,
      // 検索実行用のクエリ
      execQuery : ''
    }
  },
  async mounted(){
    this.execQuery = this.query
  },
  methods: {
    async executeSearch(){
      this.execQuery = this.query
      this.$router.push(`/quizzes/search?query=${this.query}`)
    }
  }

}
</script>
