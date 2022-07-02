<template>
  <div class="row" v-if="!isLoading">
    <div v-if="!quiz" class="col-sm-12 col-lg-8 mx-auto mb-4">
      <b-alert show variant="warning">指定のQuizは存在しないか、削除済みです</b-alert>
      <b-button @click="$router.go(-1)">戻る</b-button>
    </div>

    <div v-if="quiz" class="col-sm-12 col-lg-8 mx-auto mb-4">
      <div class="quiz-action">
        <b-button v-if="isQuizOwner && !editMode" @click="editQuiz" class="btn-sub">編集する</b-button>
        <b-button v-if="isQuizOwner" @click="$refs['delete-quiz-modal'].show()" class="btn-danger delete-btn-desktop">削除する</b-button>
      </div>
      <template v-if="!(isQuizOwner && editMode)">
        <div class="quiz-show">
          <div>
            <span class="mr-3" v-for="(val) in quiz.tags">#{{val.value}}</span>
            <span class="quiztype-label">{{getValue('quizTypes', quiz.type)}}</span>
            <h2 class="quiz-show__title">{{ quiz.title }}</h2>
            <div v-if="quiz.answerOpenedAt" class="mt-2">
              <span class="icon-color">
                <b-icon icon="unlock-fill"></b-icon>
              </span>
              解答公開日：{{quiz.answerOpenedAt.seconds | format-date-from-unixtime}}
            </div>

            <p v-html="$md.render(quiz.content || '')" class="quiz-show__text"></p>
            <div>
              <nuxt-link :to="`/users/${quiz.creatorRefObject.uid}`" class="quiz-content__user" v-if="quiz.creatorRefObject">
                <img :src="quiz.creatorRefObject.photoURL | userIcon"><span>{{ quiz.creatorRefObject.displayName }}</span>
              </nuxt-link>
              <span class="quiz-content__create">
                {{ (quiz.createdAt && quiz.createdAt.seconds) | format-datetime-from-unixtime }}
              </span>
            </div>

          </div>
        </div>

        <template v-if="quiz.type === 'selection'">
        </template>

        <div class="text-center mt-3">
          <ActionList :firestoreDoc="firestoreQuiz" :actions="masterMap.actionsMap.quiz"></ActionList>

          <ShareButton :page-title="quiz.title" class="" style="display:inline-block;"/>
        </div>

        <template v-if="isLoggedIn && !isQuizOwner">
          <div v-b-toggle.collapse-answer-form  class="quiz-show__inputhead mt-4">
            <h3 class="quiz-show__subtitle">
              解答を入力する
            </h3>
            <div class="quiz-show__inputhead_icon">
              <b-icon icon="chevron-down" class=""></b-icon>
            </div>
          </div>
          <b-collapse id="collapse-answer-form">
          <template  v-if="quiz.type === 'selection'">
            <div class="row mt-4">
              <div class="col-sm-3 quiz-create__item-head">
                <label class="quiz-create__label">
                  解答
                </label>
                <span class="required-item">必須</span>
              </div>
              <b-form-group label="" class="col-sm-9">
                <b-form-radio v-for="(candidate, index) in quiz.answerCandidates"
                              :key="index" v-model="myAnswer.answerBody" :name="`candidate-${index}`" :value="candidate">{{candidate}}</b-form-radio>
              </b-form-group>
            </div>
          </template>

          <template v-else-if="quiz.type === 'decidedAnswer'">
            <div class="row mt-4">
              <div class="col-sm-3 quiz-create__item-head">
                <label class="quiz-create__label">
                  解答本文
                </label>
                <span class="required-item">必須</span>
              </div>
              <b-form-group label="" class="col-sm-9">
                <ContentEditForm v-model="myAnswer.answerBody" :is-required="isAnswerSubmitted"
                                 @imageSelected="onImageSelected($event)" target-type="myAnswer-answerBody" />
              </b-form-group>
            </div>
          </template>

          <div class="row mt-4">
            <div class="col-sm-3 quiz-create__item-head">
              <label class="quiz-create__label">
                解説
              </label>
              <span class="any-item">任意</span>
            </div>
            <b-form-group label="" class="col-sm-9">
              <ContentEditForm v-model="myAnswer.explanation"
                               @imageSelected="onImageSelected($event)" target-type="myAnswer-explanation" />
            </b-form-group>
          </div>

          <div class="row justify-content-md-center mt-3">
            <div class="col-sm-6">
              <b-button @click="createAnswer" class="btn-main btn-lg btn-block">解答する</b-button>
            </div>
          </div>
        </b-collapse>
        </template>
        <template v-else-if="!isLoggedIn">
          <div class="mt-4">
            <p><nuxt-link :to="`/login?redirect_url=${redirectUrl}`">ログイン(ユーザ登録)</nuxt-link>すると解答できます。30秒で完了します！</p>
          </div>

        </template>

        <template v-if="isAnswersVisible || isQuizOwner || haveMySurrender">
          <div>
            <h3 class="quiz-show__subtitle mt-4">出題者解答</h3>
            <!-- TODO: ログインを促すメッセージが3箇所あるので見せ方を要見直し -->
            <span v-if="haveMySurrender">降参済み</span>
            <span>
              <b-icon icon="flag" class="useraction-icon"></b-icon> 降参数: {{surrenders.length}}
            </span>
          </div>
          <b-card class="mt-3">
            <p class="quiz-show__text" v-html="$md.render(quiz.answer || '')"/>
          </b-card>
          <h3 v-if="quiz.explanation" class="quiz-show__subtitle mt-4">解説</h3>
          <b-card v-if="quiz.explanation">
            <template v-if="isLoggedIn">
              <p class="quiz-show__text" v-html="$md.render(quiz.explanation)"/>
            </template>
            <template v-else>
              <p><nuxt-link :to="`/login?redirect_url=${redirectUrl}`">ログイン(ユーザ登録)</nuxt-link>すると解説が表示されます。</p>
            </template>
          </b-card>
        </template>
        <b-card v-else-if="quiz.answerOpenedAt && $moment(quiz.answerOpenedAt.toDate()) > $moment()" class="mt-4">
          <p>このクイズの出題者解答を見るには、あなたの解答が必要です。出題者解答の一般公開日は{{ $moment(quiz.answerOpenedAt.toDate()).format('YYYY年MM月DD日') }}です。</p>
        </b-card>
        <b-card v-else class="mt-4">
          <p>(自分で解答をするか、「降参して解答を見る」ボタンを押すと、正解を見ることができます)</p>
          <span class="d-block">
            <b-icon icon="flag" class="useraction-icon"></b-icon> 降参数: {{surrenders.length}}
          </span>
          <b-button @click="$refs['surrender-modal'].show()" class="btn-sub mt-2">降参して解答を見る</b-button>
        </b-card>

        <template v-if="isAnswersVisible || isQuizOwner || haveMySurrender">
          <h3 class="quiz-show__subtitle mt-4">みんなの解答({{answers.length}}件)</h3>
          <div class="mt-4" v-if="answers.length > 0">
            <b-card v-for="(answer, index) in answers"  :key="index" class="mb-3">
              <p v-if="answer.creatorRef.id === me.uid">(あなたの解答)</p>
              <p class="quiz-show__text" v-html="$md.render(answer.answerBody || '')"></p>
              <p class="quiz-show__text" v-html="$md.render(answer.explanation || '')"></p>
              <ActionList :firestoreDoc="answer.doc" :actions="masterMap.actionsMap.answer" :creator="quiz.creatorRefObject"></ActionList>
              <UserAndTime :user="answer.creator" :time="answer.createdAt"></UserAndTime>
            </b-card>
          </div>
        </template>

        <hr class="mt-3">

        <CommentList :firestoreCommentsQueryBase="firestoreCommentsQueryBase" :quizCreator="quiz.creatorRefObject"></CommentList>

        <div class="mt-4">
          <div v-b-toggle.collapse-comment-form  class="quiz-show__inputhead mt-4">
            <h4 class="quiz-show__subtitle">
              コメントを書く
            </h4>
            <div class="quiz-show__inputhead_icon">
              <b-icon icon="chevron-down" class=""></b-icon>
            </div>
          </div>
          <template v-if="isLoggedIn">
            <b-collapse id="collapse-comment-form">
            <div class="row mt-4">
              <div class="col-sm-2 quiz-create__item-head">
                <label class="quiz-create__label">
                  コメント本文
                </label>
              </div>
              <b-form-group class="col-sm-10">
                  <ContentEditForm
                    v-model="comment.content"
                    :disabled="editMode"
                    :is-required="isCommentSubmitted"
                    @imageSelected="onImageSelected($event)"
                    target-type="comment" />
              </b-form-group>
            </div>
            <div class="row justify-content-md-center mt-3">
              <div class="col-sm-6">
                <b-button @click="createComment" :disabled="editMode" class="btn-main btn-lg btn-block">コメントする</b-button>
              </div>
            </div>
          </b-collapse>
          </template>
          <template v-else>
            <div class="mt-4">
              <p><nuxt-link :to="`/login?redirect_url=${redirectUrl}`">ログイン(ユーザ登録)</nuxt-link>するとコメントできます。</p>
            </div>
          </template>
        </div>
        <div>
          <b-button v-if="isQuizOwner" @click="$refs['delete-quiz-modal'].show()" class="btn-danger delete-btn-mobile mx-auto">削除する</b-button>
        </div>
      </template>

      <template v-else><!--  クイズ編集　-->
        <h3>クイズ編集</h3>
        <b-form>
          <b-form-group id="input-group-4" label="クイズタイプ" label-for="input-4">
            <b-form-select
              id="input-4"
              v-model="quiz.type"
              :options="masterMap.quizTypes.map(type => ({value: type.code, text: type.value}))"
              required
            ></b-form-select>
          </b-form-group>

          <b-form-group label="クイズジャンル:">
            <b-form-checkbox-group
              id="checkbox-group-1"
              name="flavour-1"
              v-model="quizTagsTmp"
              :options="masterTagsForCheckbox"
              :state="isQuizUpdateSubmitted ? quizTagsTmp.length > 0 : null"></b-form-checkbox-group>
          </b-form-group>

          <b-form-group
            id="input-group-1"
            label="クイズタイトル:"
            label-for="input-1"
          >
            <b-form-input
              id="input-1"
              v-model="quiz.title"
              placeholder="クイズのタイトルを入力してください"
              :state="isQuizUpdateSubmitted ? quiz.title.length > 0 : null"
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2">
            <ContentEditForm v-model="quiz.content" :is-required="isQuizUpdateSubmitted"
                             @imageSelected="onImageSelected($event)" target-type="content" :text-rows="8"/>
          </b-form-group>


          <b-form-group v-if="quiz.type === 'selection'" id="input-group-answer-candidate" label="選択肢">
            <b-form-input v-for="(_, index) in quiz.answerCandidates"
                          class="candidate-list" :key="index"
                          v-model="quiz.answerCandidates[index]"
                          :placeholder="`選択肢${index + 1}`"
            ></b-form-input>
            <b-button @click="quiz.answerCandidates.push('')" variant="primary" class="btn-sub">選択肢を追加</b-button>
          </b-form-group>

          <b-form-group id="input-group-3" label-for="input-3">
            <ContentEditForm v-model="quiz.answer" :is-required="isQuizUpdateSubmitted"
                             @imageSelected="onImageSelected($event)" target-type="answer"/>
          </b-form-group>

          <b-form-group id="input-group-3" label-for="input-3">
            <ContentEditForm v-model="quiz.explanation"
                             @imageSelected="onImageSelected($event)" target-type="explanation"/>
          </b-form-group>

          <b-form-group id="input-group-answer-opened-at" label-for="input-answer-opened-at">
            <label for="answer-opened-at-datepicker">解答公開日(設定された場合、指定日までは解答を見るのに自分の解答を要投稿)</label>
            <b-form-datepicker id="answer-opened-at" v-model="answerOpenedAt" class="mb-2"
              today-button reset-button close-button></b-form-datepicker>
          </b-form-group>

          <b-button @click="updateQuiz" variant="primary" class="btn-main">更新</b-button>
          <b-button @click="$refs['edit-quiz-modal'].show()" variant="primary" class="btn-sub">キャンセル</b-button>
        </b-form>
      </template>

    </div>
    <b-modal ref="edit-quiz-modal" title="クイズ編集のキャンセル"
      @ok="cancelUpdateQuiz">
      <p>編集中の内容は失われてしまいますがよろしいですか？</p>
    </b-modal>
    <b-modal ref="delete-quiz-modal" title="クイズの削除"
      @ok="deleteQuiz">
      <p>削除したクイズは戻せません。削除してよろしいですか？？</p>
    </b-modal>
    <b-modal ref="surrender-modal" title="降参する"
      @ok="surrenderToAnswer">
     <p>本当に降参しますか?(降参した情報は記録に残り、取り消せません)</p>
    </b-modal>
    <b-modal ref="insufficient-input-modal" title="入力内容確認" hide-footer>
      <p>入力が必要な項目で、未入力のものがあります。</p>
      <p>赤枠で囲まれたフォームの入力を確認ください</p>
      <b-button class="primary" @click="$refs['insufficient-input-modal'].hide()">OK</b-button>
    </b-modal>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { mapState, mapGetters } from 'vuex'
import ShareButton from "~/components/ShareButton.vue";
import InputHelpText from "~/components/InputHelpText.vue";
import ContentEditForm from "~/components/ContentEditForm";
import CommentList from "~/components/organisms/CommentListForQuiz";
import ActionList from "~/components/organisms/ActionList";
import UserAndTime from "~/components/molecules/UserAndTime"
import cloneDeep from 'lodash/cloneDeep'
import pkg from '~/package'

export default {
  name: "quiz-detail",
  components: {
    ShareButton,
    InputHelpText,
    ContentEditForm,
    CommentList,
    ActionList,
    UserAndTime
  },
  head() {
    return {
      title: this.quiz?.title || 'Quiz詳細ページ',
      meta: [
        { hid: 'og:title', name: 'og:title', content: this.quiz?.title || 'Quiz詳細ページ' },
        { hid: 'og:description', name: 'og:description', content: this.shortContentWithoutPicture },
        { hid: 'og:image', name: 'og:image', content: this.imageUrl },
        { hid: 'og:type', name: 'og:type', content: 'website' },
        { hid: 'description', name: 'description', content: this.shortContentWithoutPicture }
      ]
    }
  },
  props:{
    quizId: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      quiz: null,
      beforeEditQuiz: {},
      masterTagsForCheckbox: [],
      quizTagsTmp: [],
      surrenders: [],
      db: null,
      firestoreQuiz: null,
      firestoreMe: null,
      firestoreCommentsQueryBase: null,
      answers:[],
      myAnswer: {
        answerBody: '',
        explanation: ''
      },
      comment: {
        title: '',
        content: ''
      },
      isQuizOwner: false,
      editMode: false,
      answerOpenedAt: null,
      isAnswersVisible: false,
      isLoading: true,
      isQuizUpdateSubmitted: false,
      isAnswerSubmitted: false,
      isCommentSubmitted: false,
    }
  },
  computed: {
    ...mapState('user', ['me']),
    ...mapState('master', ['masterMap']),
    ...mapGetters('master', ['getValue']),
    imageUrl(){
      const imageUrlMatch = this.quiz?.content?.match(/!\[.*\]\((https.*) .*\)/)
      return imageUrlMatch ? imageUrlMatch[1] : ''
    },
    shortContentWithoutPicture(){
      return this.quiz?.content?.replace(/!\[.*\]\(.*\)/, ' ')?.replace(/\n/g, '')?.slice(0,100)
    },
    haveMyAnswer() {
      return this.answers.some(answer => answer.creatorRef.id === this.me.uid)
    },
    haveMySurrender() {
      return this.surrenders.some(surrender => this.isLoggedIn ? (surrender.userRef && surrender.userRef.id === this.firestoreMe.id) : surrender.tempUserId === this.$store.state.tempUserId)
    },
    title() {
      return this.quiz.title
    },
    isLoggedIn(){
      return this.me.uid
    },
    redirectUrl(){
      return location.pathname + location.search
    }
  },
  async mounted(){
    this.masterTagsForCheckbox = this.masterMap.quizTags.map(tag => { return { text: tag.value, value: tag.code } });
    //コンテンツのアップデートをチェックする
    this.db = await firebase.firestore()
    if(this.isLoggedIn) this.firestoreMe = await this.db.collection('users').doc(this.me.uid)
    this.firestoreQuiz = await this.db.collection('quizzes').doc(this.quizId)

    const unsub = this.firestoreQuiz
      .onSnapshot(snapshot => {
        const data = snapshot.data()
        if(data && !data.deletedAt) {
          this.quiz = data
          console.log('Quiz updated', this.quiz)
          this.isQuizOwner = this.me.uid == this.quiz.creatorRef.id;
          this.quizTagsTmp = Object.keys(this.quiz.tags);
          this.quiz.creatorRef.get().then(doc => this.$set(this.quiz, 'creatorRefObject', doc.data()))
        }
        this.isLoading=false

      })

    // RenderOnlyの場合はFirestoreの接続を切る
    if(this.$route.query.isRenderOnly){
      setTimeout(() => {
        firebase.app().delete()
      }, 5000)
    }

    this.firestoreCommentsQueryBase = this.firestoreQuiz.collection('comments')

    this.firestoreQuiz.collection('answers').orderBy('createdAt')
      .onSnapshot((snapshot) => {
        this.answers = snapshot.docs.map(doc => {
          const data = doc.data();
          this.$set(data, 'doc', doc.ref);
          return this.replaceReferenceContent(data, 'creatorRef', 'creator')
        })
        if (this.haveMyAnswer) {
          this.isAnswersVisible = true;
        }
        console.log('Quiz answers updated', this.answers);
      });

    this.firestoreQuiz.collection('surrenders')
      .onSnapshot((snapshot) => {
        this.surrenders = snapshot.docs.map(doc => {
          return doc.data()
        })
        console.log('Quiz surrenders updated', this.surrenders);
      });
  },
  methods: {
    async updateQuiz() {
      if(
          this.quizTagsTmp.length == 0 ||
          this.quiz.title.length == 0 ||
          this.quiz.content.length == 0 ||
          this.quiz.answer.length == 0
        ){
        this.$refs['insufficient-input-modal'].show()
        this.isQuizUpdateSubmitted = true
        return
      }
      //トーストの表示
      let toast = this.$toasted.show("更新しました", { 
        theme: "outline", 
        position: "top-right", 
        duration : 5000
      }); 

      const selectedTags = this.quizTagsTmp.map(code => ({ [code]: this.masterMap.quizTags.find(tag => tag.code === code) }));
      this.quiz.tags = Object.assign({}, ...selectedTags);
      this.quiz.answerOpenedAt = this.answerOpenedAt ? firebase.firestore.Timestamp.fromDate(new Date(this.answerOpenedAt)) : null
      await this.firestoreQuiz.set(this.quiz, { merge: true });
      this.editMode = false;
    },
    editQuiz(){
      this.beforeEditQuiz = cloneDeep(this.quiz)
      this.answerOpenedAt = this.quiz.answerOpenedAt ? this.$moment(this.quiz.answerOpenedAt.toDate()).format('YYYY-MM-DD') : ''
      this.editMode = true
    },
    cancelUpdateQuiz(){
      this.quiz = cloneDeep(this.beforeEditQuiz)
      this.editMode = false;
    },
    async createAnswer() {
      const userRef = this.firestoreMe
      if(this.myAnswer.answerBody.length == 0){
        this.$refs['insufficient-input-modal'].show()
        this.isAnswerSubmitted = true

        return
      }
      const answer = {
        creatorRef: userRef,
        answerBody: this.myAnswer.answerBody,
        explanation: this.myAnswer.explanation,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deletedAt: null
      };
      await this.firestoreQuiz.collection('answers').add(answer)

      this.myAnswer.answerBody = ''
      this.myAnswer.explanation = ''
    },
    async createComment(){
      const userRef = await this.firestoreMe
      if(this.comment.content.length == 0){
        this.$refs['insufficient-input-modal'].show()
        this.isCommentSubmitted = true

        return
      }
      const comment = {
        creatorRef: userRef,
        quizId: this.quizId,
        parentCommentId: null,
        title: this.comment.title,
        content: this.comment.content,
        type: 'question',
        countPositiveVote: 0,
        countNegativeVote: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deletedAt: null
      }

      await this.firestoreQuiz.collection('comments').add(comment)

      this.comment.title = ''
      this.comment.content = ''
    },
    async deleteQuiz() {
      this.quiz.deletedAt = firebase.firestore.FieldValue.serverTimestamp()
      await this.firestoreQuiz.set(this.quiz, { merge: true });
      this.$router.push('/')
    },
    // TODO: pages/index.vueで重複するため用component化
    replaceReferenceContent(content, referenceName, replaceName){
      if(content[referenceName] && typeof content[referenceName].get == 'function') {
        content[referenceName].get().then(doc => {
          this.$set(content, replaceName, doc.data());
        })
      }
      return content
    },
    // TODO: quizzes/new のメソッドと重複するため用リファクタリング
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

            // TODO: 解答の場合分けを追加している。これ以上増えるようであれば整理を検討する
            if(targetType === 'myAnswer-answerBody'){
              this.myAnswer.answerBody += imgText
            }else if(targetType === 'myAnswer-explanation'){
              this.myAnswer.explanation += imgText
            }else if(targetType === 'comment'){
              this.comment.content += imgText
            }else{
              this.quiz[targetType] += imgText
            }
          })
          console.log('file upload is done')
        })
      }
    },
    async surrenderToAnswer(){
      const surrender = {
        userRef: this.isLoggedIn ? this.firestoreMe : null,
        tempUserId: this.isLoggedIn ? null : this.$store.state.tempUserId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }
      await this.firestoreQuiz.collection('surrenders').add(surrender)
    },
  }
}
</script>

<style lang='scss' scoped>
.quiz-action {
  padding: 20px 0 10px;
}

.quiz-show {
  background-color: #fff;
  margin: 10px 0;
  padding: 20px;
  border-radius: 10px;
  &__inputhead {
    cursor: pointer;
    background-color: #F0F0F0;
    display: block;
    padding: 10px;
    &_icon {
      display: inline-block;
      padding-top: 5px;
      position: absolute;
      right: 35px;
    }
  }
}

@media screen and (min-width:991px) {
  .delete-btn-mobile{
    display: none;
  }
  .delete-btn-desktop{
    margin: 10px 0;
    float: right;
  }
}

@media screen and (max-width:768px) {
  .quiz-show {
    margin: 10px -15px;
    padding: 20px 30px;
  }
}

.quiz-show__text {
  margin-bottom: 2em;
}

.quiz-show__subtitle {
  font-size: 18px;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 0;
  padding: 5px 0;
}

.quiz-show__mheader {
  font-size: 16px;
  font-weight: 700;
  padding: 10px 0;
}

.quiztype-label {
  background: #FFFFFF;
  margin: 0 5px;
  padding: 5px 10px;
}

.quiz-show >>> img {
  max-width: 100%;
  height: auto;
}

.quiz-show__text >>> img {
  max-width: 100%;
  height: auto;
}

@media screen and (max-width: 991px) {
  .delete-btn-mobile{
    display: block;
    float: center;
    margin-top: 75px;
  }

  .delete-btn-desktop{
    display: none; 
  }
}

</style>
