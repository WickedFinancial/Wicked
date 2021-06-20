import { Store } from "vuex"
import { getModule } from "vuex-module-decorators"
import Web3Module from "~/store/web3"

// eslint-disable-next-line import/no-mutable-exports
let web3Store: Web3Module

function initialiseStores(store: Store<any>): void {
  // Any additional store modules would go here
  web3Store = getModule(Web3Module, store)
}

export { initialiseStores, web3Store }
