import {
  Module,
  VuexAction as Action,
  VuexModule,
  VuexMutation as Mutation,
} from "nuxt-property-decorator"
import WalletConnectProvider from "@walletconnect/web3-provider"
import Web3modal from "web3modal"
import { ethers } from "ethers"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "3ce35c3d389a4461bffd073fbf27d23e",
    },
  },
}

let web3Modal: Web3modal
let currentProvider: ethers.providers.Web3Provider | undefined

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

@Module({
  stateFactory: true,
  name: "web3",
  namespaced: true,
})
export default class web3 extends VuexModule {
  isConnected = false
  modalInitializing = false
  providerSet = false

  get selectedAccount(): string {
    if (this.isConnected) {
      const modalProvider = getCurrentProvider()
      const provider = modalProvider?.provider as any
      return provider.selectedAddress
    } else {
      return ""
    }
  }

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
  setModalInitializing(state: boolean) {
    this.modalInitializing = state
  }

  @Mutation
  clearProvider() {
    currentProvider = undefined
    this.providerSet = false
    this.isConnected = false
  }

  @Action({ rawError: true })
  async connectWeb3() {
    this.context.commit("setModalInitializing", true)
    const webModal = initializeModal()
    let provider: typeof webModal.connect
    try {
      provider = await webModal.connect()
      this.context.commit("setEthersProvider", provider)
      this.context.commit("setConnectionStatus", true)
    } catch (e: unknown) {
      console.log("Error connecting to Web3")
      this.context.commit("setConnectionStatus", false)
    } finally {
      this.context.commit("setModalInitializing", false)
    }
  }
}
