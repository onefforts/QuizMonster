const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config')

const algoliasearch = require("algoliasearch")
const projectId = process.env.GCLOUD_PROJECT
const SITE_URL = config[projectId].SITE_URL

const ALGOLIA_ID = config[projectId].ALGOLIA_ID
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key
const ALGOLIA_INDEX_NAME = `${config[projectId].ENVIRONMENT}_quizzes`

// インデックスつける対象が増えたら追加する
const INDEXES_ATTRIBUTES_LIST = ['content', 'title', 'tags', 'type', 'answer', 'explanation']

module.exports = functions.region('us-central1').firestore.document('quizzes/{id}').onWrite((snap, context) => {
  const algoliaClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

  console.log('Quizzes Updated context: ', context)
  console.log('Quizzes Updated before ', snap.before.data())
  console.log('Quizzes Updated after ', snap.after.data())
  const afterData = snap.after.data()
  // deletedAtがある更新＝削除とみなす
  const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME)
  if(afterData.deletedAt){
    console.log('quizzes was deleted.')
    index.deleteObject(context.params.id)
    return 1
  }
  afterData.objectID = context.params.id
  const registerData = {}
  registerData.objectID = context.params.id
  INDEXES_ATTRIBUTES_LIST.forEach(attribute => {
    registerData[attribute] = afterData[attribute]
  })

  return index.saveObject(registerData)
})




