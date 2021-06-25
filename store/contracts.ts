import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { ethers } from "ethers"
import LSPAbi from "~/abis/LSP.json"
import { getCurrentProvider } from "~/store/web3"
import {
  LSPConfiguration,
  SyntheticTokenContractMapping,
  SyntheticTokenBalances,
} from "~/types"

const abis: Record<string, Array<string>> = require("~/abis")
const addresses: Record<string, string> = require("~/addresses.json")

const lspContracts: Record<string, ethers.Contract> = {}
const collateralContracts: Record<string, ethers.Contract> = {}
const syntheticTokenContracts: Record<string, SyntheticTokenContractMapping> =
  {}

@Module({
  stateFactory: true,
  name: "contracts",
  namespaced: true,
})
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("~/deployedContractConfigs.json")
  syntheticTokenBalances: Record<string, SyntheticTokenBalances> = {}
  collateralTokenBalances: Record<string, number> = {}
  contractsInitialized: boolean = false
  tokenBalancesLoaded: boolean = false

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
  setTokenBalancesLoaded(loaded: boolean) {
    this.tokenBalancesLoaded = loaded
  }

  @Mutation
  setCollateralTokenBalance(payload: {
    collateralName: string
    collateralBalance: number
  }) {
    const { collateralName, collateralBalance } = payload
    console.log(
      `Set collateral balance of ${collateralName} to ${collateralBalance}`
    )
    let newValues: Record<string, number> = {}
    newValues[collateralName] = collateralBalance
    this.collateralTokenBalances = Object.assign(
      {},
      this.collateralTokenBalances,
      newValues
    )
  }

  @Mutation
  setSyntheticTokenBalances(payload: {
    syntheticName: string
    longBalance: number
    shortBalance: number
  }) {
    const { syntheticName, longBalance, shortBalance } = payload
    console.log(
      `Setting long / short balances for ${syntheticName} to:`,
      longBalance,
      shortBalance
    )

    let newValues: Record<string, SyntheticTokenBalances> = {}
    newValues[syntheticName] = { longBalance, shortBalance }

    this.syntheticTokenBalances = Object.assign(
      {},
      this.syntheticTokenBalances,
      newValues
    )
  }

  @Action({ rawError: true })
  async approveCollateral(payload: {
    collateralName: string
    syntheticName: string
  }) {
    const { collateralName, syntheticName } = payload
    console.log(
      `Approving tokens of ${collateralName} to ${syntheticName}`
    )
    const lspAddress = lspContracts[syntheticName].address
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      const collateralContract =
        collateralContracts[collateralName].connect(signer)
    const amount = ethers.constants.MaxUint256
      console.log("Parsed values: ", {
        lspAddress,
        collateralContract,
        amount,
      })
      const approveTx = await collateralContract.approve(
        lspAddress,
        amount
      )
      await approveTx.wait()
    }
  }

  @Action({ rawError: true })
  async mintTokens(payload: { amount: number; syntheticName: string }) {
    const { amount, syntheticName } = payload
    console.log(`Minting ${amount} tokens of ${syntheticName}`)
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      const lspContract = lspContracts[syntheticName].connect(signer)
      const parsedAmount = ethers.utils.parseUnits(amount.toString())
      console.log("Parsed values: ", {
        lspContract,
        parsedAmount,
      })
      const mintTx = await lspContract.create(
        parsedAmount
      )
      await mintTx.wait()
    }
  }

  @Action({ rawError: true })
  async updateTokenBalances() {
    this.context.commit("setTokenBalancesLoaded", false)
    await this.context.dispatch("updateCollateralTokenBalances")
    await this.context.dispatch("updateSyntheticTokenBalances")
    this.context.commit("setTokenBalancesLoaded", true)
  }

  @Action({ rawError: true })
  async updateSyntheticTokenBalances() {
    const selectedAccount = this.context.rootGetters["web3/selectedAccount"]

    for (const [
      syntheticName,
      { shortContract, longContract },
    ] of Object.entries(syntheticTokenContracts)) {
      const shortBalance = parseFloat(
        ethers.utils.formatEther(await shortContract.balanceOf(selectedAccount))
      )

      const longBalance = parseFloat(
        ethers.utils.formatEther(await longContract.balanceOf(selectedAccount))
      )

      this.context.commit("setSyntheticTokenBalances", {
        syntheticName,
        shortBalance,
        longBalance,
      })
    }
  }

  @Action({ rawError: true })
  async updateCollateralTokenBalances() {
    const selectedAccount = this.context.rootGetters["web3/selectedAccount"]
    for (const [collateralName, collateralContract] of Object.entries(
      collateralContracts
    )) {
      const collateralBalance = parseFloat(
        ethers.utils.formatEther(
          await collateralContract.balanceOf(selectedAccount)
        )
      )
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
      throw new Error("Provider is undefined - cannot initialize contracts")
    } else {
      for (const config of this.contractConfigs) {
        if (config.address !== undefined) {
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
