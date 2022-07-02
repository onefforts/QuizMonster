import firebase from '@firebase/app'
import '@firebase/firestore'
import '@firebase/auth'
import '@firebase/storage';
import config from '../firebase-config'

function isAppInitialized(){
  const APP_NAME = '[DEFAULT]'
  return firebase.apps && firebase.apps.includes(APP_NAME)
}


const environment = process.env.NODE_ENV
console.log('running environment:', __DEF_DEPLOY_ENV)
if(!isAppInitialized()){
  console.log('firebase', firebase)
  firebase.initializeApp(config[__DEF_DEPLOY_ENV]);
}

export default firebase
