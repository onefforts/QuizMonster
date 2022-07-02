// const firebase = require('@firebase/firestore')
import firebase from '@firebase/app'
import '@firebase/firestore'
import algoliasearch from 'algoliasearch'

const ENVIRONMENT = process.env.ENVIRONMENT || 'development'
console.log(`ENVIRONMENT: ${ENVIRONMENT}`)
const INDEXES_ATTRIBUTES_LIST = ['content', 'title', 'tags', 'type', 'answer', 'explanation']

// 実行前にEnvにいれる
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY
const ALGOLIA_INDEX_NAME = `${ENVIRONMENT}_quizzes`

// Babelを使わないとimportできないっぽいので、一旦ここにもconfig書く..
const config = {
  production: {
    ALGOLIA_ID: 'QPL1G7G4UE',
    apiKey: 'AIzaSyDZQIpdUV8t8Y-OKOAlXoMyJ_bEqm-rmCM',
    authDomain: 'sangaku-prod.firebaseapp.com',
    projectId: 'sangaku-prod',
    storageBucket: 'gs://sangaku-prod.appspot.com'
  },
  development: {
    ALGOLIA_ID: 'QPL1G7G4UE',
    apiKey: 'AIzaSyArBaPbcxUyRRSlY9goYahf2vQTNT2CoFU',
    authDomain: 'sangaku-dev.firebaseapp.com',
    projectId: 'sangaku-dev',
    storageBucket: 'gs://sangaku-dev.appspot.com'
  }
}

// firebase.initializeApp(ENVIRONMENT);

function register(){
  firebase.default.initializeApp(config[ENVIRONMENT])
  const algoliaClient = algoliasearch(config[ENVIRONMENT].ALGOLIA_ID, ALGOLIA_ADMIN_KEY)
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME)
  firebase.default.firestore().collection('quizzes').get().then(res => {
    const quizzes = res.docs.map(doc => ({id: doc.id, data: doc.data()}))

    quizzes.forEach(quiz => {
      const registerData = {}
      console.log(`start register ${quiz.id} ${quiz.data.title}`)
      registerData.objectID = quiz.id
      INDEXES_ATTRIBUTES_LIST.forEach(attribute => {
        registerData[attribute] = quiz.data[attribute]
      })
      index.saveObject(registerData).catch( e => {
        console.error(`index register error: ${JSON.stringify(e)}`)
      })
    })

  }).catch(e => {
    console.error(`error: ${e}`)
  })
}

register()
