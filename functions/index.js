//TODO: Functionの数が多くなってくると、毎回全てをロードするので、改良を検討する。
//See: https://uyamazak.hatenablog.com/entry/2018/10/22/113000

const projectId = process.env.GCLOUD_PROJECT

const admin = require('firebase-admin')
admin.initializeApp()

exports.quiz = require('./quiz')
exports.user = require('./user')
exports.sitemap = require('./sitemap')
exports.onQuizUpdated = require('./onQuizUpdated')

//定期実行ジョブ(Blazeプラン以上)
exports.scheduledFirestoreExport = require('./scheduledFirestoreExport')
