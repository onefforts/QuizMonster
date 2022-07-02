// マスタデータは一旦ストアに定義してみる
const like = { type: 'like', display: 'いいね' };

export const state = () => ({
  masterMap: {
    quizTypes: [
      {code: 'decidedAnswer', value: '自由記述(答えあり)'},
      {code: 'selection', value: '選択問題'},
      {code: 'opinion', value: '意見募集'},
    ],
    quizTags: [
      {code: 'mathematics', value: '数学'},
      {code: 'poker', value: 'ポーカー'},
    ],
    actionsMap: {
      quiz: [like],
      comment: [like],
      answer: [like]
    },
  }
})

export const getters = {
  getValue: (state) => (type, code) => {
    if(!state.masterMap[type]){
      return null
    }
    const record = state.masterMap[type].find(record => record.code === code)
    return record ? record.value : null
  }
}
