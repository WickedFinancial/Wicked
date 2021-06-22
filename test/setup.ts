import Vue from "vue"
import Vuetify from "vuetify"
import Vuex, { Store, StoreOptions } from "vuex"

Vue.use(Vuetify)
Vue.use(Vuex)

let store: Store<any>

export const createStore = (options: StoreOptions<any>): Store<any> => {
  // If not a test, return undefined as nuxt will build
  if (process.env.NODE_ENV === "test") {
    if (store === undefined) {
      // if a test and undefined, create a new store
      store = new Vuex.Store(options)
    } else {
      // if a test and called again, create a new store with merged options
      store = new Vuex.Store({ ...store, ...options })
    }
  }
  return store
}
