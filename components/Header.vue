<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand>
      <n-link to="/" style="color: white; text-decoration: none; font-weight: 700;">
        <img src="/img/logo.png" alt="QuizMonster" style="height: 65px;"/>
      </n-link>
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto" v-if="me.uid">
        <b-nav-item href="#" @click="$router.push('/quizzes/new')" class="btn btn-nav d-none d-lg-block">クイズを作る</b-nav-item>
        <b-nav-item-dropdown right class="d-none d-lg-block">
          <template v-slot:button-content>
            <span>
              <img class="header__icon" style="" :src="me.photoURL | userIcon"/>
              <em>メニュー</em>
            </span>
          </template>
          <b-dropdown-item href="#" @click="$router.push('/users/me')">マイページ</b-dropdown-item>
          <b-dropdown-item href="#" v-if="hostURL() === 'quizhub.info'" @click="$router.push('/quizzes/b5Tki0lmNXdryPtb5Csz')">ご意見・ご要望募集</b-dropdown-item>
          <b-dropdown-item href="#" @click="logout">ログアウト</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-dropdown-item class="nav-item d-lg-none nav-sp" href="#" @click="$router.push('/quizzes/new')">クイズを作る</b-dropdown-item>
        <b-dropdown-item class="nav-item d-lg-none nav-sp" href="#" style="color: white" @click="$router.push('/users/me')">マイページ</b-dropdown-item>
        <b-dropdown-item v-if="hostURL() === 'quizhub.info'" class="nav-item d-lg-none nav-sp" style="color: white" @click="$router.push('/quizzes/b5Tki0lmNXdryPtb5Csz')">ご意見・ご要望募集</b-dropdown-item>
        <b-dropdown-item class="nav-item d-lg-none nav-sp" href="#" style="color: white" @click="logout">ログアウト</b-dropdown-item>
      </b-navbar-nav>
      <n-link v-else to="/login" class="btn nav-login btn-login ">ログイン</n-link>

    </b-collapse>
  </b-navbar>

</template>

<script>
import firebase from '~/plugins/firebase'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'

export default {
  name: "Header",
  methods:{
    logout(){
      firebase.auth().signOut()
    },
    hostURL(){
      return location.host
    },
  },
  computed: {
    ...mapState('user', ['me'])
  }

}

</script>

<style scoped>
.title{
  font-size: 2em;
  font-weight: 700;
  flex: 1
}

.header__icon {
  border-radius: 20px;
  height: 2em;
  margin: 0 5px;
  object-fit: cover;
  width: 2em;
}
.navbar {
  background-image: url(/img/sitepage_renga.png);
  background-repeat: round;
}

</style>
