import { v4 as uuidv4 } from 'uuid'
import firebase from '~/plugins/firebase'

export default async function ({ route, store, redirect }) {
  // VueRouterのmeta情報で、isNoRedirectが指定されている場合は、未ログイン状態でもログインページに戻さない
  const authOption = route.meta.find(option => option.authenticated)
  const isNoRedirect = authOption && authOption.authenticated.isNoRedirect

  await new Promise( (resolve, reject) => {
    firebase.auth().onAuthStateChanged(async authUser => {
      const db = firebase.firestore()
      if(authUser){
        console.log('is logged in')
        const usersRef = db.collection('users');
        const userDoc = await usersRef.doc(authUser.uid).get()
        let user = userDoc.data()

        if(!userDoc.exists){
          // ユーザをfireStoreに登録. 新規ユーザ情報入力画面に飛ばしてもいいかも
          await usersRef.doc(authUser.uid).set({
            uid: authUser.uid,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          user = authUser // ユーザ作成時は `user`変数にデータが入っていないため一旦authUserをいれてやる
        }

        store.commit('user/setUserInfo', {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      }else{
        console.log('is not logged in.')
        store.commit('user/setUserInfo', {
          uid: null,
          displayName: null,
          photoURL: null,
        })

        if(!store.state.tempUserId) store.commit('setTempUserId', uuidv4()) // 未ログイン時ユーザ特定用のuuid付与

        if(!isNoRedirect) redirect('/login')
      }
      resolve()
    })
  })
}
