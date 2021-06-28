/* eslint-disable import/no-mutable-exports */
import { Store } from "vuex"
import { getModule } from "nuxt-property-decorator"
import web3 from "~/store/web3"
import contracts from "~/store/contracts"

let web3Store: web3
let contractsStore: contracts

function initialiseStores(store: Store<any>): void {
  // Any additional store modules would go here
  web3Store = getModule(web3, store)
  contractsStore = getModule(contracts, store)
}

export { initialiseStores, web3Store, contractsStore }
