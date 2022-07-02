export const state = () => ({
  me: {
    uid: '',
    displayName: '',
    photoURL: '',
  }
})

export const mutations = {
  setUserInfo(state, {uid, displayName, photoURL}){
    state.me = {uid, displayName, photoURL}
  }
}

export const getters = {
  getUserInfo: async state => {
    return state.me
  }
}

export const actions = {
}
