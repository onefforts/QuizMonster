export const strict = true
export const state = () => ({
  tempUserId: null,
})

export const mutations = {
  setTempUserId(state, tempUserId){
    state.tempUserId = tempUserId
  }
}
