import Vuex, { Store } from "vuex"
import { Vue, getModule } from "nuxt-property-decorator"
import web3 from "~/store/web3"

// eslint-disable-next-line import/no-mutable-exports
let web3Store: web3

function initialiseStores(store: Store<any>): void {
  // Any additional store modules would go here
  web3Store = getModule(web3, store)
}

export { initialiseStores, web3Store }

let testStore: Store<any>
if (process.env.NODE_ENV === "test") {
  Vue.use(Vuex)
  testStore = new Vuex.Store({})
}

export function testingStore() {
  if (process.env.NODE_ENV === "test") {
    return testStore
  } else {
    return undefined
  }
}
