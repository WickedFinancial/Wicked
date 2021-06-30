import {
  Module,
  VuexAction as Action,
  VuexModule,
  VuexMutation as Mutation,
} from "nuxt-property-decorator"
import Web3modal from "web3modal"
import { ethers } from "ethers"
import { MetaMaskInpageProvider } from "@metamask/providers"

let web3Modal: Web3modal
let currentProvider: ethers.providers.Web3Provider | undefined

function initializeModal() {
  // window must be available so we delay instantiating till later
  if (!web3Modal)
    web3Modal = new Web3modal({
      network: "kovan",
      cacheProvider: false,
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
  networkInfo: ethers.providers.Network = { name: "", chainId: -1 }
  correctNetwork = "kovan"
  activeNetwork = ""
  selectedAccount = ""

  get onCorrectNetwork() {
    return this.networkInfo.name === this.correctNetwork
  }

  get signer() {
    const modalProvider = getCurrentProvider()
    if (modalProvider !== undefined) {
      return modalProvider.getSigner(this.selectedAccount)
    } else {
      return undefined
    }
  }

  @Mutation
  setNetworkInfo(networkInfo: ethers.providers.Network) {
    const provider: unknown = getCurrentProvider()?.provider
    const metamaskProvider = provider as MetaMaskInpageProvider
    this.selectedAccount = metamaskProvider.selectedAddress ?? ""
    this.networkInfo = networkInfo
    this.activeNetwork = networkInfo.name
  }

  @Mutation
  setSelectedAccount(address: string) {
    this.selectedAccount = address
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
  registerListeners(metamaskProvider: MetaMaskInpageProvider) {
    if (metamaskProvider.isMetaMask) {
      console.log("Registering account listener")
      metamaskProvider.on("accountsChanged", async (accounts) => {
        const account = (accounts as Array<string>)[0]
        console.log("Detected account update: %s", account)
        this.context.commit("setSelectedAccount", account)
        await this.context.dispatch(
          "contracts/updateContractData",
          {},
          { root: true }
        )
      })

      // Note that this will not be triggered if we change between networks with the same chain id
      // Tried this but did not work: https://docs.ethers.io/v5/concepts/best-practices/#best-practices
      metamaskProvider.on("chainChanged", () => {
        console.log("Detected network change, reload page")
        window.location.reload()
      })
    }
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
      await this.context.dispatch("registerListeners", provider)
      await this.context.dispatch("updateNetworkInfo")
    } catch (e: unknown) {
      console.log("Error connecting to Web3")
      this.context.commit("setConnectionStatus", false)
    } finally {
      this.context.commit("setModalInitializing", false)
    }
  }

  @Action({ rawError: true })
  async updateNetworkInfo() {
    const ethersWeb3Provider = getCurrentProvider()
    if (this.providerSet && ethersWeb3Provider) {
      const networkInfo = await ethersWeb3Provider.getNetwork()
      this.context.commit("setNetworkInfo", networkInfo)
    }
  }
}
