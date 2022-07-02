const functions = require('firebase-functions')
const config = require('./config')
const projectId = process.env.GCLOUD_PROJECT
const SITE_URL = config[projectId].SITE_URL
const fs = require('fs');
const axios = require('axios')

const RENDERTRON_URL = 'http://rendertron.quizhub.info:3000'

const botUserAgents = [
  'googlebot',
  'google-structured-data-testing-tool',
  'bingbot',
  'linkedinbot',
  'mediapartners-google',
]

module.exports = functions.region('us-central1').https.onRequest(async function(req, res) {

  try{

    // /users/:id からのアクセスを想定
    const [, , userId] = req.path.split('/')

    const userAgent = req.get('user-agent')
    console.log('user-agent', userAgent)

    const botRegExp = new RegExp(botUserAgents.join('|'), 'i')

    if(userAgent.match(botRegExp)){
      console.log('Detected as Crawler!!', userAgent)
      console.log('rendertron url', `${RENDERTRON_URL}/render/${SITE_URL}/users/${userId}${encodeURIComponent('?isRenderOnly')}`)
      const renderRes = await axios.get(`${RENDERTRON_URL}/render/${SITE_URL}/users/${userId}${encodeURIComponent('?isRenderOnly=true')}`)
      res.set("Cache-Control", "public, max-age=600, s-maxage=600");
      res.status(200).end(renderRes.data)
      return
    }

    const html = fs.readFileSync("./index.html", 'utf8');

    res.set("Cache-Control", "public, max-age=600, s-maxage=600");
    res.status(200).end(html)

    //TODO: 通常のURL張り付けによるOGP対応は別途必要

  }catch(e){
    console.error(`user function error: ${e}`)
    res.status(500).end('get user error')
  }

})
