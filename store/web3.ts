import {
  Module,
  VuexAction as Action,
  VuexModule,
  VuexMutation as Mutation,
} from "nuxt-property-decorator"
import { ethers } from "ethers"
import { MetaMaskInpageProvider } from "@metamask/providers"

let currentProvider: ethers.providers.Web3Provider | undefined

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
  blockTimestamp = 0

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
  setEthersProvider(provider: MetaMaskInpageProvider) {
    try {
      currentProvider = new ethers.providers.Web3Provider(provider as never)
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

  @Mutation
  setBlockTimestamp(timestamp: number) {
    this.blockTimestamp = timestamp
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
    const ethersProvider = new ethers.providers.Web3Provider(
      metamaskProvider as any
    )
    ethersProvider.on("block", async (blockNumber) => {
      const block = await ethersProvider.getBlock(blockNumber)
      console.log("Block timestamp:", block.timestamp)
      this.context.commit("setBlockTimestamp", block.timestamp)
    })
  }

  @Action({ rawError: true })
  async connectWeb3() {
    this.context.commit("setModalInitializing", true)
    const provider = (window as any).ethereum as MetaMaskInpageProvider
    try {
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
