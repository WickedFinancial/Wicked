import { Store } from "vuex"
import { getModule } from "nuxt-property-decorator"
import web3 from "~/store/web3"

// eslint-disable-next-line import/no-mutable-exports
let web3Store: web3

function initialiseStores(store: Store<any>): void {
  // Any additional store modules would go here
  web3Store = getModule(web3, store)
}

export { initialiseStores, web3Store }
