<template>
<div>
  <b-button @click="windowOpen(twitterShareLink())" class="btn-twitter">
    <b>Twitterでシェア</b>
  </b-button>
</div>
</template>

<script>
export default {
  name: 'ShareButton',
  props: {
    pageTitle: {
      type: String,
      default: process.env.siteName
    }
  },
  data() {
    return {
      url: location.href,
      hashTag: process.env.siteName,
    }
  },
  computed:{
    // /quzzes/show?id=xxxxxxxxxx の形式の場合は、強引に /quizzes/xxxxxxxxx に変換している。
    // クイズ詳細以外のURLをシェアするときは修正する
    shareUrl(){
      return this.url.replace(/show\/?\?id=/, '')
    }
  },
  methods: {
    twitterShareLink() {
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.shareUrl)}&text=${this.pageTitle}&hashtags=${this.hashTag}&lang=ja`
    },
    windowOpen(link) {
      return window.open(link, '_blank', 'top=100,left=100,width=600,height=500')
    }
  }
}
</script>
