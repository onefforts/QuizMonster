<template>
  <div style="display: inline">
    <span class="action-list">
      <span v-for="(action, index) in actions" :key="action.type" class="action">
        <b-button
          :class="haveMyActionByType(action.type) ? 'btn-like-active' : 'btn-like'"
          @click="actionToDoc(action.type)">
          <b-icon :icon="'heart'+(haveMyActionByType(action.type) ? '-fill' : '')"
            :class="['icon'+action.type]"></b-icon>
          <span>{{ actionsByType(action.type).length }} {{ action.display }}</span>
        </b-button>

        <span v-if="creator && haveCreatorActionByType(action.type)" class="icon-like like-owner__contents">
          <b-icon-heart-fill></b-icon-heart-fill>
          <span>
            <img :src="creator.photoURL | userIcon" class="profile__img--sm">
          </span>
        </span>
      </span>
    </span>


    <!-- REFACTOR: 対象の数だけモーダル用Objectを生成してしまうため、ログイン用functionは別途用意する -->
    <b-modal ref="modal-login" size="lg" centered title="ユーザ登録して、QuizMonsterを使ってみませんか？">
      <p>この機能を利用するにはログイン(ユーザ登録)が必要です。30秒で完了します！</p>
      <div class="modal-contents__group">
        <p class="modal-contents__group__header">ログインすると使える機能</p>
        <ul>
          <li>クイズに解答することができます</li>
          <li>正解と解説を見ることができます</li>
          <li>いいねやコメントをつけることができます</li>
          <li>自分の問題を投稿できます</li>
        </ul>
      </div>
      <template v-slot:modal-footer="{ ok, cancel, hide }" class="modal-contents__footer">
      <b-button to="/login" size="lg" variant="success" @click="ok()" class="btn-main">
        登録する/ログインする
      </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import firebase from '~/plugins/firebase'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'action-list',
  props: {
    firestoreDoc: {
      type: Object,
      required: true
    },
    actions: {
      type: Array,
      required: true
    },
    creator: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      actionHistories: [],
      db: null,
      firestoreMe: null
    }
  },
  async mounted() {
    this.db = await firebase.firestore()
    if(this.isLoggedIn) this.firestoreMe = await this.db.collection('users').doc(this.me.uid)

    this.firestoreDoc.collection('actions')
      .onSnapshot((snapshot) => {
        this.actionHistories = snapshot.docs.map(doc => {
          let data = doc.data();
          data.id = doc.id;
          return data;
        })
        console.log('Quiz actions updated', this.actionHistories);
      });
  },
  computed:{
    ...mapState('user', ['me']),
    haveMyActionByType() {
      return function(type) {
        return this.actionsByType(type).some(action => this.isLoggedIn && action.userRef && action.userRef.id === this.firestoreMe.id)
      }
    },
    haveCreatorActionByType() {
      return function(type) {
        return this.actionsByType(type).some(action => action.userRef && action.userRef.id === this.creator.uid)
      }
    },
    actionsByType() {
      return function(type) {
        return this.actionHistories.filter(action => action.type == type)
      }
    },
    isLoggedIn(){
      return this.me && this.me.uid
    },
  },
  methods: {
    async actionToDoc(actionType){

      if(!this.isLoggedIn) {
        this.$refs['modal-login'].show()
        return;
      }

      const myActionsByType = this.actionHistories.filter(action => action.type == actionType && (this.isLoggedIn && action.userRef ? action.userRef.id === this.me.uid : action.tempUserId === this.$store.state.tempUserId))

      if(myActionsByType.length > 0) {
        myActionsByType.forEach( action => {
          this.firestoreDoc.collection('actions').doc(action.id).delete();
        });
      }else{
        const action = {
          type: actionType,
          userRef: this.isLoggedIn ? this.firestoreMe : null,
          tempUserId: this.isLoggedIn ? null : this.$store.state.tempUserId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
        await this.firestoreDoc.collection('actions').add(action)
      }
    },
  }
}
</script>
<style>
.icon-like {
  color: #de1c66;
}
.like-owner__contents {
  position: relative;
  bottom: -5px;
  padding: 5px;
}
</style>
