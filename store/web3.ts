import {
  VuexAction as Action,
  VuexMutation as Mutation,
  VuexModule,
  Module,
} from "nuxt-property-decorator"
import WalletConnectProvider from "@walletconnect/web3-provider"
import Web3modal from "web3modal"
import { ethers } from "ethers"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { infuraId: "3ce35c3d389a4461bffd073fbf27d23e" },
  },
}

let web3Modal: Web3modal
let currentProvider: ethers.providers.Web3Provider

function initializeModal() {
  // window must be available so we delay instantiating till later
  if (!web3Modal)
    web3Modal = new Web3modal({
      network: "kovan",
      cacheProvider: false,
      providerOptions,
    })
  return web3Modal
}

export const getCurrentProvider = () => {
  return currentProvider
}

@Module({ stateFactory: true, name: "web3", namespaced: true })
export default class web3 extends VuexModule {
  isConnected = false
  modalInitialized = false
  providerSet = false

  @Mutation
  setConnectionStatus(status: boolean) {
    this.isConnected = status
  }

  @Mutation
  setEthersProvider(provider: any) {
    try {
      currentProvider = new ethers.providers.Web3Provider(provider)
      this.providerSet = true
    } catch (e: unknown) {
      console.log(
        "error converting to web3Provider to ethersProvider: %s",
        provider
      )
      this.providerSet = false
    }
  }

  @Mutation
  clearProvider() {
    currentProvider = undefined as any
    this.providerSet = false
    this.isConnected = false
  }

  @Action({ rawError: true })
  async connectWeb3() {
    const webModal = initializeModal()
    let provider: any
    try {
      provider = await webModal.connect()
      this.context.commit("setEthersProvider", provider)
      this.context.commit("setConnectionStatus", true)
    } catch (e: unknown) {
      console.log("Error connecting to Web3")
      this.context.commit("setConnectionStatus", false)
    }
  }
}
