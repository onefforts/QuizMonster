<template>
  <div>
    <b-container>
      <div class="row">
        <div class="col-sm-12 col-lg-8 mx-auto mt-4 mb-4">
          <b-card border-variant="dark" class="mt-3" :header="`${displayName}さんのページ`">
            <!-- ここはいい感じにスタイル直す -->
            <div style="display: flex">
              <b-img class="profile-icon" :src="photoURL | userIcon" ></b-img>
              <div style="margin:10px">
                <div>ユーザ名: {{displayName}}</div>
              </div>
            </div>
          </b-card>
          <div class="mt-4">
             <b-tabs class="profile__tabs">
               <b-tab title="クイズ">
              	 <b-card class="profile__card" >
                   <quiz-list :firestoreQuizzesQueryBase="firestoreQuizzesQueryBase"></quiz-list>
                   <hr class="content-border">
              	 </b-card>
               </b-tab>
            
               <b-tab title="コメント">
              	 <b-card  class="profile__card" >
                   <CommentList :firestoreCommentsQueryBase="firestoreCommentsQueryBase" ></CommentList>
                   <hr class="content-border">
                 </b-card>
               </b-tab>
             </b-tabs>
          </div>
        </div>
      </div>
    </b-container>
    <div> </div>
  </div>
</template>

<script>
import Vue from 'vue'
import firebase from '~/plugins/firebase'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import QuizList from "../../components/organisms/QuizList"
import CommentList from "../../components/organisms/CommentList" 

export default {
  middleware: 'authenticated',
  meta: {
    authenticated: { isNoRedirect: true }
  },
  head() {
    return {
      title: `${this.displayName}さん`,
      meta: [
        { hid: 'og:title', name: 'og:title', content: `${this.displayName} さん` },
        { hid: 'og:image', name: 'og:image', content: this.user?.photoURL },
        { hid: 'og:type', name: 'og:type', content: 'website' },
        { hid: 'og:description', name: 'og:description', content: `${this.displayName}さんのクイズ一覧` },
        { hid: 'description', name: 'description', content: `${this.displayName}さんのクイズ一覧` }
      ]
    }
  },
  data(){
    return {
      userQuizzes: [],
      displayName: '',
      photoURL: '',
      firestoreQuizzesQueryBase: {},
      firestoreCommentsQueryBase: {},
    }
  },
  components: { QuizList,CommentList},
  async mounted() {
    const inputUid = this.$route.params.id
    if(inputUid){
      this.getUser(inputUid)
      await this.getQuizzes(inputUid)
    }

    // RenderOnlyの場合はFirestoreの接続を切る
    if(this.$route.query.isRenderOnly){
      setTimeout(() => {
        firebase.app().delete()
      }, 5000)
    }

  },
  methods: {
    async getUser(uid){
      const db = firebase.firestore()
      const userRef = db.collection('users').doc(uid)
      const userDoc = await userRef.get()
      if(!userDoc.exists){
        console.warn(`users ${uid} was not found.`)
        return
      }
      const user = userDoc.data()
      this.displayName = user.displayName
      this.photoURL = user.photoURL
    },
    async getQuizzes(uid){
      const db = firebase.firestore()
      const userRef = db.collection('users').doc(uid)
      const quizzesRef = db.collection('quizzes').where('deletedAt', '==', null)
      this.firestoreQuizzesQueryBase = quizzesRef.where('creatorRef', '==', userRef).orderBy('createdAt', 'desc')
      
      this.firestoreCommentsQueryBase = await db.collectionGroup('comments')
        .where('deletedAt', '==', null)
        .where('creatorRef', '==', userRef)
    }
  }
}
</script>

<style scoped>
.profile-icon {
  margin: 10px;
  max-width: 48px;
  max-height: 48px;
}

.quiz-content >>> .card-body{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quiz-content >>> img {
  max-width: 100%;
  height: auto;
}

.profile__card{
  border-top: 0;
}

</style>
