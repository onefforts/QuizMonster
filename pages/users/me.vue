<template>
  <div>
    <b-container>
      <div class="row" v-if="!isEditing">
        <div class="col-sm-12 col-lg-8 mx-auto mt-4 mb-4">
          <b-card border-variant="dark" class="mt-3" header="マイページ">
            <div>
              <div class="profile-base">
                <b-img class="profile__img" :src="user.photoURL" ></b-img>
                <p class="profile__name">{{user.displayName}}</p>
              </div>
              <div class="mt-3">
                <p>自己紹介: {{user.introduction}}</p>
              </div>
            </div>
            <b-button v-if="!isEditing" @click="editUser" class="btn-sub">編集する</b-button>
          </b-card>

          <b-tabs class="profile__tabs">
            <b-tab title="クイズ">
              <b-card class="profile__card" >
                <quiz-list :firestoreQuizzesQueryBase="firestoreQuizzesQueryBase"></quiz-list>
                <hr class="content-border">
              </b-card>
            </b-tab>
            <b-tab title="コメント">
              <b-card class="profile__card" >
                <CommentList :firestoreCommentsQueryBase="firestoreCommentsQueryBase" ></CommentList>
                <hr class="content-border">
              </b-card>
            </b-tab>
            <b-tab title="解答">
              <b-card class="profile__card" >
                <AnswerList :firestoreAnswerQueryBase="firestoreAnswerQueryBase" ></AnswerList>
                <hr class="content-border">
              </b-card>
            </b-tab>
 	        </b-tabs>
        </div>
      </div>

      <template v-else>
        <div class="row">
          <div class="col-sm-12 col-lg-8 mx-auto mt-4 mb-4">
            <h2 class="quiz-show__title">プロフィール編集</h2>
            <b-form class="mt-3">

              <div class="row">
                <label class="col-sm-3">プロフィール画像</label>
                <b-form-group class="col-sm-9" id="input-group-0" label-for="input-0">
                  <b-img width="300px" :src="user.photoURL" ></b-img>
                </b-form-group>
              </div>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">画像変更</label>
                <div class="col-sm-9">
                  <input @change="replacePhotoURL($event)" accept=".jpg, .jpeg, .png, .svg" type="file"/>
                </div>
              </div>

              <div class="form-group row">
                <label class="col-sm-3 col-form-label">ユーザー名</label>
                <b-form-group
                  id="input-group-1"
                  label-for="input-1"
                  class="col-sm-9"
                >
                  <b-form-input
                    id="input-1"
                    v-model="user.displayName"
                    required
                    placeholder="表示名を入力してください"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">自己紹介</label>
                <b-form-group id="input-group-2" label-for="input-2" class="col-sm-9">
                  <b-form-textarea style="min-height: 150px;" v-model="user.introduction" placeholder="自己紹介文を入力してください"/>
                </b-form-group>
              </div>

              <b-button @click="updateUser" variant="primary" class="btn-main">更新</b-button>
              <b-button @click="isConfirmingCancel = true" variant="primary" class="btn-sub">キャンセル</b-button>
            </b-form>
            <b-modal v-model="isConfirmingCancel" title="プロフィール編集のキャンセル"
              @ok="cancelUpdateUser">
              <p>編集中の内容は失われてしまいますがよろしいですか？</p>
            </b-modal>
          </div>
        </div>
      </template>
    </b-container>
  </div>
</template>

<script>
import Vue from 'vue'
import firebase from '~/plugins/firebase'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import QuizList from "../../components/organisms/QuizList"
import CommentList from "../../components/organisms/CommentList" 
import AnswerList from "../../components/organisms/AnswerList"

export default {
  name: "users",
  middleware: 'authenticated',
  data(){
    return {
      user: {},
      beforeEditUser: {},
      isEditing: false,
      isConfirmingCancel: false,
      firestoreQuizzesQueryBase: {},
      firestoreCommentsQueryBase: {},
      firestoreAnswerQueryBase: {}, 
    }
  },
  components: { QuizList,CommentList,AnswerList},
  async mounted() {
    await this.getMyQuizzes(this.me.uid)
  },
  methods: {
    async getMyQuizzes(uid){
      const db = firebase.firestore()
      const firestoreUserRef = await db.collection('users').doc(uid)
      
      this.firestoreQuizzesQueryBase = await db.collection('quizzes')
        .where('deletedAt', '==', null)
        .where('creatorRef', '==', firestoreUserRef)
        .orderBy('createdAt', 'desc')
      this.user = await firestoreUserRef.get().then(doc => doc.data())
      
      this.firestoreCommentsQueryBase = await db.collectionGroup('comments')	
        .where('deletedAt', '==', null)
        .where('creatorRef', '==', firestoreUserRef)
    
      this.firestoreAnswerQueryBase = await db.collectionGroup('answers')
        .where('deletedAt', '==', null)
        .where('creatorRef', '==', firestoreUserRef)
    },
    editUser(){
      this.beforeEditUser = cloneDeep(this.user)
      this.isEditing = true
    },
    async updateUser(){
      await firebase.firestore().collection('users').doc(this.me.uid).set(this.user, { merge: true });
      this.$store.commit('user/setUserInfo', this.user)
      this.isEditing = false
    },
    replacePhotoURL(event){
      if(event.target.files[0]){
        const strings = event.target.files[0].name.split('.')
        const fileObj = event.target.files[0]
        const storageRef = firebase.storage().ref().child(`images/users/${this.me.uid}/photo.${strings[strings.length -1]}`)

        storageRef.put(fileObj).then( (snapshot) => {
          snapshot.ref.getDownloadURL().then( url => {
            this.user.photoURL = url
          })
          console.log('file upload is done')
        })
      }
    },
    cancelUpdateUser(){
      this.user = this.beforeEditUser
      this.isEditing = false
    },

  },
  computed: {
    uid(){
      return this.me.uid
    },
    ...mapState('user', ['me'])
  }
}
</script>

<style scoped>
.profile-icon {
  margin: 10px;
  max-width: 48px;
  max-height: 48px;
}

.profile__tabs {
  margin-top: 20px;
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
