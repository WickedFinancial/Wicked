/* eslint-disable import/no-mutable-exports */
import { Store } from "vuex"
import { getModule } from "nuxt-property-decorator"
import web3 from "~/store/web3"
import contracts from "~/store/contracts"
import prices from "~/store/prices"

let web3Store: web3
let contractsStore: contracts
let pricesStore: prices

function initialiseStores(store: Store<any>): void {
  // Any additional store modules would go here
  web3Store = getModule(web3, store)
  contractsStore = getModule(contracts, store)
  pricesStore = getModule(prices, store)
}

export { initialiseStores, web3Store, contractsStore, pricesStore }
