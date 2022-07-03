# プロジェクト名: QuizMonster

## QuizMonsterについて
Quizを投稿したり、回答することにより良質なNFTを発行できる新しいQuizプラットフォームです。

ユニークで面白いQuizの作成を促進するとともに、回答しやすい環境を作ることにより
人間の知的好奇心を満たし、より活性化することを目指しています。
またNFTを導入することにより、良問/良回答が生まれることを加速しようと試みます。
良問/良回答には他ユーザからのフィードバックが多くなり、閾値以上の良フィードバックを受けることがNFT化の条件になっており、NFT化された情報の良さを担保できると言う仮説を持っています。

## 解決しようとしている課題
- NFTの価値が非常に曖昧な状態で取引されている。
  -> 何らかの形でNFTの価値を担保/明示化したい
- 

## 使用した技術
- Nuxt.js(Webフレームワーク)
- Versel(Hosting Pratform)
- Firebase(認証、DB)
- Algolia(SaaS型検索サービス)
- HardHat(開発環境)
- OpenZeppelin(Library)

## スマートコントラクトのPolygonscanリンク
https://mumbai.polygonscan.com/address/0x9555BCC9c05F597e80338E4776C1Ef05407BAC0A

## 直面した課題
- ブロックチェーンの必要必然性の議論の再燃
- コントラクトのユニーク性の確保

## Future works
- 定期的なオンライン/オフラインイベント
- 週次的なノルマミッション
- キャラ育成機能(モンスター/人物キャラクター)
- 現存のクイズサイトとコラボや協業関係相談

# Build Setup Tutorial

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## Firebase CLI セットアップ
この辺を参考に
https://docbase.io/posts/562681/sharing/8de9c769-61f6-4164-818f-aa6844c64eac

```
 $ curl -sL firebase.tools | bash
 $ firebase login 
```

## Firebase デプロイ

```
 $ yarn generate
 $ firebase deploy --only hosting
```

# 参考資料

## FireStore

### Cloud Firestore でデータを取得する
https://firebase.google.com/docs/firestore/query-data/get-data?hl=ja

### Cloud Firestore でのデータの並べ替えと制限
https://firebase.google.com/docs/firestore/query-data/order-limit-data?hl=ja

## Bootstrap Vue
https://bootstrap-vue.js.org/docs


## 【JavaScript、Vue.js、Nuxt.js】命名規則 個人的まとめ
https://qiita.com/ryunishimura/items/3883953b982014b4b83e

## その他ライブラリ

### KaTeX
https://katex.org/
