import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { LSPConfiguration } from "~/hardhat.config"
import { getCurrentProvider } from "./web3"
import { ethers } from "ethers"
import LSPAbi from "@/abis/LSP.json"
const abis: Record<string, Array<string>> = require("@/abis")
const addresses: Record<string, string> = require("@/addresses.json")
console.log(abis)

type SyntheticTokenContractMapping = {
  shortContract: ethers.Contract
  longContract: ethers.Contract
}

@Module
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("../deployedContractConfigs.json")
  lspContracts: Record<string, ethers.Contract> = {}
  collateralContracts: Record<string, ethers.Contract> = {}
  syntheticTokenContracts: Record<string, SyntheticTokenContractMapping> = {}

  get syntheticNames() {
    return this.contractConfigs.map((config) => config.syntheticName)
  }

  get getLspContracts(): Record<string, ethers.Contract> {
    return this.lspContracts
  }

  get getCollateralContracts(): Record<string, ethers.Contract> {
    return this.collateralContracts
  }

  get getSyntheticTokenContracts(): Record<
    string,
    SyntheticTokenContractMapping
  > {
    return this.syntheticTokenContracts
  }

  @Mutation
  setLspContract(payload: {
    syntheticName: string
    lspContract: ethers.Contract
  }) {
    console.log("Set LSP Payload", payload)
    const { syntheticName, lspContract } = payload
    console.log(`Setting Lsp Contract ${syntheticName} to: `, lspContract)
    this.lspContracts[syntheticName] = lspContract
  }

  @Mutation
  setCollateralContract(payload: {
    collateralName: string
    collateralContract: ethers.Contract
  }) {
    const { collateralName, collateralContract } = payload
    console.log(
      `Setting Collateral Contract ${collateralName} to: `,
      collateralContract
    )
    this.collateralContracts[collateralName] = collateralContract
  }

  @Mutation
  setSyntheticTokenContracts(payload: {
    syntheticName: string
    longContract: ethers.Contract
    shortContract: ethers.Contract
  }) {
    const { syntheticName, longContract, shortContract } = payload
    console.log(
      `Setting shortContract Contract ${syntheticName} to: `,
      shortContract
    )
    console.log(
      `Setting longContract Contract ${syntheticName} to: `,
      longContract
    )
    this.syntheticTokenContracts[syntheticName] = {
      longContract,
      shortContract,
    }
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
            // Instantiate LSP Contract
            const lspContract = new ethers.Contract(
              config.address,
              LSPAbi,
              provider
            )
            // Will throw an error if contract is not deployed on current network
            await lspContract.deployed()
            const syntheticName = config.syntheticName
            this.context.commit("setLspContract", {
              syntheticName,
              lspContract,
            })

            // Instantiate Collateral Contract
            const collateralName = config.collateralToken
            const collateralAddress = addresses[collateralName]
            const collateralAbi = abis[collateralName]
            console.log(
              `Connecting to collateral ${collateralName} at ${collateralAddress} with abi: `,
              collateralAbi
            )
            const collateralContract = new ethers.Contract(
              collateralAddress,
              collateralAbi,
              provider
            )
            // Will throw an error if contract is not deployed on current network
            await collateralContract.deployed()
            this.context.commit("setCollateralContract", {
              collateralName,
              collateralContract,
            })

            // Instantiate Long / Short Token Contracts
            const erc20Abi = abis.ERC20
            const longAddress = await lspContract.longToken()
            const longContract = new ethers.Contract(
              longAddress,
              erc20Abi,
              provider
            )

            const shortAddress = await lspContract.shortToken()
            const shortContract = new ethers.Contract(
              shortAddress,
              erc20Abi,
              provider
            )

            this.context.commit("setSyntheticTokenContracts", {
              syntheticName,
              longContract,
              shortContract,
            })

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
