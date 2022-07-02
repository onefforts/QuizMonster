const functions = require('firebase-functions')

module.exports = functions.region('us-central1').https.onRequest(async function(req, res) {
  console.log('hello world!')
  console.log('project id', process.env.GCLOUD_PROJECT)
  res.send('hello world!!')
})


