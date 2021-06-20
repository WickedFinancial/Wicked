import {
  VuexAction,
  VuexMutation,
  VuexModule,
  Module,
} from "nuxt-property-decorator"
import WalletConnectProvider from "@walletconnect/web3-provider"
import Web3modal from "web3modal"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "3ce35c3d389a4461bffd073fbf27d23e",
    },
  },
}

@Module({ stateFactory: true, name: "web3", namespaced: true })
export default class web3 extends VuexModule {
  isConnected = false
  web3Modal?: Web3modal = undefined
  counter = 0

  @VuexMutation
  setConnectionStatus(status: boolean) {
    this.isConnected = status
  }

  @VuexMutation
  setWeb3ModalInstance(w3mObject: Web3modal) {
    this.web3Modal = w3mObject
  }

  @VuexAction({ commit: "setWeb3ModalInstance", rawError: true })
  setUpModal() {
    const modal = new Web3modal({
      network: "kovan",
      cacheProvider: true,
      providerOptions,
    })
    return modal
  }
}
