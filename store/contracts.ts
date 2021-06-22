import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { LSPConfiguration } from "~/types"
import { getCurrentProvider } from "./web3"
import { ethers } from "ethers"
import LSPAbi from "@/abis/LSP.json"
const abis: Record<string, Array<string>> = require("@/abis")
const addresses: Record<string, string> = require("@/addresses.json")

type SyntheticTokenContractMapping = {
  shortContract: ethers.Contract
  longContract: ethers.Contract
}

type SyntheticTokenBalances = {
  shortBalance: number
  longBalance: number
}

let lspContracts: Record<string, ethers.Contract> = {}
let collateralContracts: Record<string, ethers.Contract> = {}
let syntheticTokenContracts: Record<string, SyntheticTokenContractMapping> = {}

@Module
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("~/deployedContractConfigs.json")
  syntheticTokenBalances: Record<string, SyntheticTokenBalances> = {}
  collateralTokenBalances: Record<string, number> = {}

  get syntheticNames() {
    return this.contractConfigs.map((config) => config.syntheticName)
  }

  get getCollateralTokenBalances(): Record<string, number> {
    return this.collateralTokenBalances
  }

  get getSyntheticTokenBalances(): Record<string, SyntheticTokenBalances> {
    return this.syntheticTokenBalances
  }

  @Mutation
  setCollateralTokenBalance(payload: {
    collateralName: string
    collateralBalance: number
  }) {
    const { collateralName, collateralBalance } = payload
    console.log(`Set collateral balance of ${collateralName} to ${collateralBalance}`)
    this.collateralTokenBalances[collateralName] = collateralBalance
  }

  @Mutation
  setsyntheticTokenBalances(payload: {
    syntheticName: string
    longBalance: number
    shortBalance: number
  }) {
    const { syntheticName, longBalance, shortBalance } = payload
    this.syntheticTokenBalances[syntheticName] = { longBalance, shortBalance }
  }

  @Action({ rawError: true })
  async updateTokenBalances() {
      await this.context.dispatch("updateCollateralTokenBalances")
  }

  @Action({ rawError: true })
  async updateCollateralTokenBalances() {
    const selectedAccount = this.context.rootGetters["web3/selectedAccount"]

    for (const [collateralName, collateralContract] of Object.entries(collateralContracts)) {
      const collateralBalance = (await collateralContract.balanceOf(
        selectedAccount
      )).toNumber()
      this.context.commit("setCollateralTokenBalance", {
        collateralName,
        collateralBalance,
      })
    }
  }

  @Action({ rawError: true })
  async initializeContracts() {
    console.log("Connecting to contracts")
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
            lspContracts[syntheticName] = lspContract

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
            collateralContracts[collateralName] = collateralContract

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

            syntheticTokenContracts[syntheticName] = {
              longContract,
              shortContract,
            }

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
