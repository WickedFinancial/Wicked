import { getAccessorType, mutationTree, actionTree } from "typed-vuex"

export const state = () => ({})

export type RootState = ReturnType<typeof state>

export const getters = {}

export const mutations = mutationTree(state, {})

export const actions = actionTree({ state, getters, mutations }, {})

export const storePattern = {
  state,
  getters,
  mutations,
  actions,
}

export const accessorType = getAccessorType(storePattern)
