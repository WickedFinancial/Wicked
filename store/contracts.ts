import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { LSPConfiguration } from "~/hardhat.config"
import { getCurrentProvider } from "./web3"
import { ethers } from "ethers"
import LSPAbi from "@/abis/LSP.json"

@Module
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("../deployedContractConfigs.json")
  contracts: Record<string, ethers.Contract> = {}

  get syntheticNames() {
    return this.contractConfigs.map((config) => config.syntheticName)
  }

  get getContracts(): Record<string, ethers.Contract> {
    return this.getContracts
  }

  @Mutation
  setContract(payload: { syntheticName: string; contract: ethers.Contract }) {
    const { syntheticName, contract } = payload
    console.log(`Setting Contract ${syntheticName} to: `, contract)
    this.contracts[syntheticName] = contract
  }

  @Action({ rawError: true })
  async initializeContracts() {
    const provider: ethers.providers.Web3Provider | undefined =
      getCurrentProvider()
    if (provider === undefined) {
      throw "Provider is undefined - cannot initialize contracts"
    } else {
      for (var config of this.contractConfigs) {
        if (config.address != undefined) {
          try {
            const contract = new ethers.Contract(
              config.address,
              LSPAbi,
              provider
            )
            await contract.deployed()
            const syntheticName = config.syntheticName
            this.context.commit("setContract", { syntheticName, contract })
            console.log(`Connected to contract ${syntheticName} succesfully`)
          } catch (e) {
            console.log(
              `Couldnt connect to contract ${config.syntheticName} due to exception: `,
              e
            )
          }
        }
      }
    }
  }
}
