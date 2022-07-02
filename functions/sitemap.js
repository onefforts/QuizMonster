const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config')

module.exports = functions.region('us-central1').https.onRequest(async function(req, res) {
  res.set('Content-Type', 'text/plain')
  const projectId = process.env.GCLOUD_PROJECT
  const baseUrl = config[projectId].SITE_URL
  let txt = `${baseUrl}/\n`
  const firestore = admin.firestore()
  // https://stackoverflow.com/questions/51441263/admin-sdk-cannot-set-settings-for-firestore
  try{
    firestore.settings({timestampsInSnapshots: true})
  }catch(error){
    // ignore
  }
  const MAX_SITEMAP_SITE = 1000
  await firestore.collection("quizzes").orderBy('createdAt', 'desc').limit(MAX_SITEMAP_SITE).get().then((quizzesQuery) => {
    const quizIds = quizzesQuery.docs.map((quizDoc) => {
      return quizDoc.id
    })
    quizIds.forEach((quizId) => {
      txt += `${baseUrl}/quizzes/${quizId}\n`
    })
  }).catch((e) => {
    res.status(200).send(txt)
    console.error('sitemap error', e)
    throw e
  })

  await firestore.collection("users").orderBy('createdAt', 'desc').limit(MAX_SITEMAP_SITE).get().then((usersQuery) => {
    const userIds = usersQuery.docs.map((userDoc) => {
      return userDoc.id
    })
    userIds.forEach((userId) => {
      txt += `${baseUrl}/users/${userId}\n`
    })
  }).catch((e) => {
    res.status(200).send(txt)
    console.error('sitemap error', e)
    throw e
  })

  res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return res.status(200).send(txt)
})
