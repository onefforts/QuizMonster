const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config')
const projectId = process.env.GCLOUD_PROJECT
const SITE_URL = config[projectId].SITE_URL
const fs = require('fs');
const {JSDOM} = require('jsdom')
const axios = require('axios')

const RENDERTRON_URL = 'http://rendertron.quizhub.info:3000'


const botUserAgents = [
  'googlebot',
  'google-structured-data-testing-tool',
  'bingbot',
  'linkedinbot',
  'mediapartners-google',
]

// TODO: クイズタイプ: マスターの別途検討しないといけない
const quizTypes = {
      selection: '選択問題',
      decidedAnswer: '自由記述(答えあり)',
      opinion: '意見募集' }

module.exports = functions.region('us-central1').https.onRequest(async function(req, res) {

  try{

    // quizId取得
    // /quizzes/:id からのアクセスを想定
    const [, , quizId] = req.path.split('/')

    const fireStore = admin.firestore()
    const doc = await fireStore.collection('quizzes').doc(quizId).get()
    const quiz = doc.data()

    const userAgent = req.get('user-agent')
    console.log('user-agent', userAgent)

    const botRegExp = new RegExp(botUserAgents.join('|'), 'i')

    if(userAgent.match(botRegExp)){
      console.log('Detected as Crawler!!', userAgent)
      console.log('rendertron url', `${RENDERTRON_URL}/render/${SITE_URL}/quizzes/${quizId}${encodeURIComponent('?isRenderOnly=true')}`)
      const renderRes = await axios.get(`${RENDERTRON_URL}/render/${SITE_URL}/quizzes/${quizId}${encodeURIComponent('?isRenderOnly=true')}`)
      res.set("Cache-Control", "public, max-age=600, s-maxage=600");
      res.status(200).end(renderRes.data)
      return
    }

    //写真URLを除去して、１00文字ぐらいに絞る
    // 画像は以下のマークダウン形式で入っていることを想定している
    // ![img-horenso.jpg](https://firebasestorage.googleapis.com/xxxxxx "img-horenso.jpg")
    const quizTypeName = quizTypes[quiz.type]
    const tagNames = Object.values(quiz.tags).map(tag => `#${tag.value}`).join(' ')
    const contentWithoutPicture = `${tagNames} ${quizTypeName} ${quiz.content.replace(/!\[.*\]\(.*\)/, ' ').replace(/\n/g, '').slice(0,100)}`

    //メイン記事から画像URLを探す
    const imageUrlMatch = quiz.content.match(/!\[.*\]\((https.*) .*\)/)
    const imageUrl = imageUrlMatch ? imageUrlMatch[1] : ''
    const html = fs.readFileSync("./index.html", 'utf8');

    const dom = new JSDOM(html)
    const document = dom.window.document
    const headElement = document.head

    // metaタグの修正(meta全部についてみてる)
    // もとからindex.htmlに含まれるmetaタグは "og:type", "og:title", "og:site_name", "og:description"
    // type と site_nameは修正なし
    const titleMetaElement = document.querySelector("meta[name='og:title']")
    if(titleMetaElement){
      titleMetaElement.content = quiz.title
    }

    const descriptionMetaElement = document.querySelector("meta[name='og:description']")
    if(descriptionMetaElement){
      descriptionMetaElement.content = contentWithoutPicture
    }

    // metaタグの追加
    const addMetaTagList = [
      {name: "og:image", content: imageUrl},
      {name: "og:url", content: `${SITE_URL}/quizzes/${quizId}`},
      {name: "twitter:site", content: SITE_URL},
      {name: "twitter:card", content: "summary"},
      {name: "twitter:image", content: imageUrl},
      {name: "twitter:description", content: contentWithoutPicture},
    ]
    addMetaTagList.forEach(metaTag => {
      const element = document.createElement("meta")
      element.name = metaTag.name
      element.content = metaTag.content
      headElement.appendChild(element)
    })

    const updateHTML = document.documentElement.outerHTML
    console.log('updateHTML', updateHTML)

    // 生成したHTMLを返却
    res.set("Cache-Control", "public, max-age=600, s-maxage=600");
    res.status(200).end(updateHTML)
  }catch(e){
    console.error(`quiz function error: ${e}`)
    res.status(500).end('get quiz error')
  }

})
