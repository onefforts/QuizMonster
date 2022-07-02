import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
  createPersistedState({
    reducer: (persistedState) => {
      const stateFilter = Object.assign({}, persistedState)
      const steteFilterKyes = Object.keys(stateFilter)
      const whiteList = ['tempUserId']

      steteFilterKyes.forEach((key) => {
        if(whiteList.indexOf(key) === -1) delete stateFilter[key]
      })

      return stateFilter
    }

  })(store)
}
