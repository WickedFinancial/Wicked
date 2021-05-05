import { getAccessorType, mutationTree, actionTree } from "typed-vuex"

export const state = () => ({
  email: "example@example.org",
})

export type RootState = ReturnType<typeof state>

export const getters = {
  email: (state: RootState) => state.email,
  fullEmail: (state: RootState) => state.email,
}

export const mutations = mutationTree(state, {
  setEmail(state, newValue: string) {
    state.email = newValue
  },

  initialiseStore() {},
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    resetEmail({ commit }) {
      commit("setEmail", "a@a.com")
    },
  }
)

export const storePattern = {
  state,
  getters,
  mutations,
  actions,
}

export const accessorType = getAccessorType(storePattern)
