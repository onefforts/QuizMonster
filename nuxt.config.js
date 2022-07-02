import webpack from 'webpack'
import pkg from './package'

const DEPLOY_ENV = process.env.DEPLOY_ENV || 'development'

export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: `%s | ${pkg.name}(クイズモンスター)`,
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: pkg.description}
    ],
    script: [
      {src: 'https://www.googletagmanager.com/gtag/js?id=G-8FV6T24WH9'},
      {src: '/gtag.js'},
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },
  env: {
    siteName: pkg.name,
    QUIZ_COUNT_PER_PAGE: 10,
    COMMENT_COUNT_PER_PAGE: 10,
    ANSWER_COUNT_PER_PAGE: 10,
    ALGOLIA_ID: 'QPL1G7G4UE',
    ALGOLIA_SEARCH_KEY: 'bcd272fcaa1a45b8ef662ff0af978182',
    DEPLOY_ENV: process.env.DEPLOY_ENV || 'development'
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {color: '#fff'},

  loadingIndicator: {
    name: 'circle',
    color: '#00A2B6',
    background: 'white'
  },

  /*
  ** Global CSS
  */
  css: [],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/filters',
    '~/plugins/katex',
    { src: '~/plugins/localStorage.js', ssr: false },
  ],

  /*
  router: {
    extendRoutes(routes, resolve) {
      // console.log('ROUTES', process.env.DE_ENV)

      routes.push({
        path: "/quizzes/show_",
        redirect: "/hoge",
        component: resolve(__dirname, 'pages/quizzes/show_.vue')
      })

    }
  },
  */
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    ['@nuxtjs/moment', ['ja']],
    '@nuxtjs/pwa',
    '@nuxtjs/markdownit',
    'bootstrap-vue/nuxt',
    '@nuxtjs/toast',
  ],
  markdownit: {
    preset: "default",
    injected: true, // $mdを利用してmarkdownをhtmlにレンダリングする
    breaks: true, // 改行コードを<br>に変換する
    html: false, // HTML タグを有効にする
    linkify: false, // URLに似たテキストをリンクに自動変換する
    typography: true,  // 言語に依存しないきれいな 置換 + 引用符 を有効にします。
    use: [
      'markdown-it-katex',
    ]
  },
  toast:{
    position: 'top-right',
  },
  bootstrapVue: {
    icons: true // Install the IconsPlugin (in addition to BootStrapVue plugin
  },
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    plugins: [
      // デプロイする環境をEnvから読み取る
      // generateする際に変換する必要があるので、DefinePluginにしている
      // もっとよい方法があるとおもうけど..
      new webpack.DefinePlugin({
        '__DEF_DEPLOY_ENV': `"${DEPLOY_ENV}"`
      })
    ],
    extend(config, ctx) {
      config.devtool = 'eval-source-map'
    }
  },
  watchers: {
    webpack: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
}

