<template>
  <div class="row">

    <div class="col-sm-12 col-lg-8 mx-auto my-4">
      <h2 class="quiz-content__title">クイズ作成</h2>

      <b-form>
        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              クイズタイプ
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-type" label-for="input-type">
            <b-form-select
              id="input-4"
              v-model="quizForm.type"
              :options="masterMap.quizTypes.map(type => ({value: type.code, text: type.value}))"
              required
            ></b-form-select>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              クイズジャンル
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group class="col-sm-8">
            <b-form-checkbox-group id="checkbox-group-1" v-model="quizForm.tags" name="flavour-1" :state="isSubmitted ? quizForm.tags.length > 0 : null">
              <b-form-checkbox v-for="(quizTag, index) in masterMap.quizTags" :key="index" :value="quizTag">{{quizTag.value}}</b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              クイズタイトル
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group
            class="col-sm-8"
            id="input-group-1"
            label-for="input-1"
          >
            <b-form-input
              id="input-1"
              v-model="quizForm.title"
              :state="isSubmitted ? quizForm.title.length > 0 : null"
              placeholder="クイズのタイトルを入力してください"
            ></b-form-input>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              クイズ本文
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-content" label-for="input-content">
              <ContentEditForm v-model="quizForm.content" form-name="" :is-required="isSubmitted"
                               @imageSelected="onImageSelected($event)" target-type="content" :text-rows="8"/>
          </b-form-group>
        </div>

        <div class="row mt-4" v-if="quizForm.type === 'selection'">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              選択肢
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-answer-candidate" label-for="input-answer-candidate">
            <b-form-input v-for="(_, index) in quizForm.answerCandidates"
                class="candidate-list col-sm-9" :key="index"
                v-model="quizForm.answerCandidates[index]"
                :placeholder="`選択肢${index + 1}`"
            ></b-form-input>
            <b-button @click="quizForm.answerCandidates.push('')" variant="primary" class="btn-sub">選択肢を追加</b-button>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              出題者回答
            </label>
            <span class="required-item">必須</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-answer" label-for="input-answer">
            <ContentEditForm v-model="quizForm.answer" :is-required="isSubmitted"
                             @imageSelected="onImageSelected($event)" target-type="answer"/>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              解説
            </label>
            <span class="any-item">任意</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-explanation" label-for="input-explanation">
            <ContentEditForm v-model="quizForm.explanation"
                             @imageSelected="onImageSelected($event)" target-type="explanation"/>
          </b-form-group>
        </div>

        <div class="row mt-4">
          <div class="col-sm-4 quiz-create__item-head">
            <label class="quiz-create__label">
              解答公開日
            </label>
            <span class="any-item">任意</span>
          </div>
          <b-form-group class="col-sm-8" id="input-group-answer-opened-at" label-for="input-answer-opened-at">
            <p>(設定された場合、指定日までは解答を見るのに自分の解答を要投稿)</p>
            <b-form-datepicker id="answer-opened-at" v-model="answerOpenedAt" class="mb-2"
              today-button reset-button close-button></b-form-datepicker>
          </b-form-group>
        </div>

        <div class="row mt-4 mb-4">
          <div class="col-sm-12 text-center">
            <b-button @click="createQuiz" class="btn-main mx-auto">作成</b-button>
          </div>
        </div>
      </b-form>

      <b-modal ref="submit-modal" title="入力内容確認" hide-footer>
        <p>入力が必要な項目で、未入力のものがあります。</p>
        <p>赤枠で囲まれたフォームの入力を確認ください</p>
        <b-button class="primary" @click="$refs['submit-modal'].hide()">OK</b-button>
      </b-modal>
    </div>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import InputHelpText from "~/components/InputHelpText.vue";
import ContentEditForm from "../../components/ContentEditForm";

export default {
  name: "quizzes-new",
  middleware: 'authenticated',
  components: {
    InputHelpText,
    ContentEditForm
  },
  head() {
    return {
      title: 'Quiz新規作成'
    }
  },
  data(){
    return {
      quizForm: {
        title: '',
        content: '',
        answer: '',
        answerCandidates: ['', '', '', ''],
        explanation: '',
        type: 'decidedAnswer',
        tags: [],
        likes: 0,
        creatorRef: {}
      },
      result: '',
      db: null,
      firestoreQuizzes: null,
      firestoreUsers: null,
      answerOpenedAt: null,
      isSubmitted: false
    }
  },
  async mounted(){
    // コンテンツのアップデートをチェックする
    this.db = await firebase.firestore()
    this.firestoreUsers = this.db.collection('users');
    this.firestoreQuizzes = await this.db.collection('quizzes')
  },
  methods: {
    async createQuiz(){
      if(
          this.quizForm.tags.length == 0 ||
          this.quizForm.title.length == 0 ||
          this.quizForm.content.length == 0 ||
          this.quizForm.answer.length == 0
        ){
        this.$refs['submit-modal'].show()

        this.isSubmitted = true
        return
      }
      const userRef = await this.firestoreUsers.doc(firebase.auth().currentUser.uid)
      // 空欄の選択肢は除く
      this.quizForm.answerCandidates = this.quizForm.answerCandidates.filter(candidate => candidate)
      this.quizForm.creatorRef = userRef
      this.quizForm.createdAt = firebase.firestore.FieldValue.serverTimestamp()
      this.quizForm.deletedAt = null
      this.quizForm.answerOpenedAt = this.answerOpenedAt ? firebase.firestore.Timestamp.fromDate(new Date(this.answerOpenedAt)) : null

      const result = await this.firestoreQuizzes.add(this.convertedData)
      this.$router.push(`/quizzes/${result.id}`)

    },
    onImageSelected({event, targetType}){
      //TODO: 画像が使われなかった時のフローを整理する(要データ削除?)
      //TODO: 無選択のときとか２回目開いたときの挙動は確認する
      console.log('image selected', event, targetType)

      //TODO: とりあえずやっつけで先頭のファイルだけ
      if(event.target.files[0]){
        //TODO: ファイル名は変換する
        const originalFileName = event.target.files[0].name
        const fileObj = event.target.files[0]
        const storageRef = firebase.storage().ref().child(`images/quizzes/${this.me.uid}/${originalFileName}`)

        storageRef.put(fileObj).then( (snapshot) => {
          snapshot.ref.getDownloadURL().then( url => {
            let imgText = `\n![${originalFileName}](${url} "${originalFileName}")\n`;
            this.quizForm[targetType] += imgText
          })
          console.log('file upload is done')
        })
      }
    },
  },
  computed: {
    // firebaseで投稿するようのデータ構造に変換する
    convertedData(){
      const data = cloneDeep(this.quizForm)
      // Objectの配列を、オブジェクトに変換する
      data.tags = data.tags.reduce( (hash, tag) => {
        hash[tag.code] = tag
        return hash
      }, {})
      return data
    },
    ...mapState('master', ['masterMap']),
    ...mapState('user', ['me'])
  }

}


</script>

<style scoped>
.candidate-list {
  margin: 0.5em 0;
}

.text-preview >>> img {
  max-width: 100%;
  height: auto;
}

</style>
