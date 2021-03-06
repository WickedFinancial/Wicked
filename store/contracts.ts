import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { ethers } from "ethers"
import LSPAbi from "~/abis/LSP.json"
import { getCurrentProvider } from "~/store/web3"
import {
  ExpiryData,
  LSPConfiguration,
  SyntheticTokenAddresses,
  SyntheticTokenBalances,
  SyntheticTokenContractMapping,
} from "~/types"

import * as abis from "~/abis"

import addresses from "~/addresses.json"

type SyntheticTokenContracts = Record<string, SyntheticTokenContractMapping>

const lspContracts: Record<string, ethers.Contract> = {}
const collateralContracts: Record<string, ethers.Contract> = {}
const syntheticTokenContracts: SyntheticTokenContracts = {}

@Module({
  stateFactory: true,
  name: "contracts",
  namespaced: true,
})
export default class contracts extends VuexModule {
  contractConfigs: Array<LSPConfiguration> = require("~/deployedContractConfigs.json")
  syntheticTokenBalances: Record<string, SyntheticTokenBalances> = {}
  syntheticTokenAddresses: Record<string, SyntheticTokenAddresses> = {}
  expiryData: Record<string, ExpiryData> = {}
  collateralTokenBalances: Record<string, number> = {}
  contractStatuses: Record<string, number> = {}
  tokenBalancesLoaded = false
  collateralAllowances: Record<string, ethers.BigNumber> = {}

  get canUpdate(): boolean {
    return (
      this.context.rootState.web3?.isConnected &&
      this.context.rootGetters["web3/onCorrectNetwork"]
    )
  }

  get syntheticNames(): Array<string> {
    return this.contractConfigs.map((config) => config.syntheticName)
  }

  @Mutation
  resetContractStatuses(): void {
    this.contractStatuses = {}
  }

  @Mutation
  resetExpiryData(): void {
    this.expiryData = {}
  }

  @Mutation
  resetTokenBalances(): void {
    this.syntheticTokenBalances = {}
    this.collateralTokenBalances = {}
    this.collateralAllowances = {}
    this.tokenBalancesLoaded = false
  }

  @Mutation
  setContractStatus(payload: { syntheticName: string; status: number }): void {
    const { syntheticName, status } = payload
    console.log(`Setting state of contract ${syntheticName} to ${status}`)
    const newValues: Record<string, number> = {}
    newValues[syntheticName] = status
    this.contractStatuses = Object.assign({}, this.contractStatuses, newValues)
  }

  @Mutation
  setTokenBalancesLoaded(loaded: boolean): void {
    this.tokenBalancesLoaded = loaded
  }

  @Mutation
  setCollateralAllowance(payload: {
    syntheticName: string
    collateralAllowance: ethers.BigNumber
  }): void {
    const { syntheticName, collateralAllowance } = payload
    console.log(
      `Set collateral allowance of ${syntheticName} to ${collateralAllowance}`
    )
    const newValues: Record<string, ethers.BigNumber> = {}
    newValues[syntheticName] = collateralAllowance
    this.collateralAllowances = Object.assign(
      {},
      this.collateralAllowances,
      newValues
    )
  }

  @Mutation
  setCollateralTokenBalance(payload: {
    collateralName: string
    collateralBalance: number
  }): void {
    const { collateralName, collateralBalance } = payload
    console.log(
      `Set collateral balance of ${collateralName} to ${collateralBalance}`
    )
    const newValues: Record<string, number> = {}
    newValues[collateralName] = collateralBalance
    this.collateralTokenBalances = Object.assign(
      {},
      this.collateralTokenBalances,
      newValues
    )
  }

  @Mutation
  setSyntheticTokenAddresses(payload: {
    syntheticName: string
    longAddress: string
    shortAddress: string
  }): void {
    const { syntheticName, longAddress, shortAddress } = payload
    console.log(
      `Setting long / short addresses for ${syntheticName} to:`,
      longAddress,
      shortAddress
    )

    const newValues: Record<string, SyntheticTokenAddresses> = {}
    newValues[syntheticName] = { longAddress, shortAddress }

    this.syntheticTokenAddresses = Object.assign(
      {},
      this.syntheticTokenAddresses,
      newValues
    )
  }

  @Mutation
  setExpiryData(payload: { syntheticName: string; data: ExpiryData }): void {
    const { syntheticName, data } = payload
    console.log(`Setting expiry data for ${syntheticName} to:`, data)

    const newValues: Record<string, ExpiryData> = {}
    newValues[syntheticName] = data

    this.expiryData = Object.assign({}, this.expiryData, newValues)
  }

  @Mutation
  setSyntheticTokenBalances(payload: {
    syntheticName: string
    longBalance: number
    shortBalance: number
  }): void {
    const { syntheticName, longBalance, shortBalance } = payload
    console.log(
      `Setting long / short balances for ${syntheticName} to:`,
      longBalance,
      shortBalance
    )

    const newValues: Record<string, SyntheticTokenBalances> = {}
    newValues[syntheticName] = { longBalance, shortBalance }

    this.syntheticTokenBalances = Object.assign(
      {},
      this.syntheticTokenBalances,
      newValues
    )
  }

  @Action({ rawError: true })
  clearContracts(): void {
    this.context.commit("resetContractStatuses")
    this.context.commit("resetTokenBalances")
  }

  @Action({ rawError: true })
  async expireContract(syntheticName: string): Promise<void> {
    console.log(`Expiring contract ${syntheticName}`)
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      const lspContract = lspContracts[syntheticName].connect(signer)
      const expireTx = await lspContract.expire()
      await expireTx.wait()
      await this.context.dispatch("updateContractStatuses")
    }
  }

  @Action({ rawError: true })
  async approveCollateral(payload: {
    collateralName: string
    syntheticName: string
  }): Promise<void> {
    const { collateralName, syntheticName } = payload
    console.log(`Approving tokens of ${collateralName} to ${syntheticName}`)
    const lspAddress = lspContracts[syntheticName].address
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      let collateralContract = collateralContracts[collateralName]
      collateralContract = collateralContract.connect(signer)
      const amount = ethers.constants.MaxUint256
      console.log("Parsed values: ", {
        lspAddress,
        collateralContract,
        amount,
      })
      const approveTx = await collateralContract.approve(lspAddress, amount)
      await approveTx.wait()
      this.context.commit("setCollateralAllowance", {
        syntheticName,
        collateralAllowance: amount,
      })
    }
  }

  @Action({ rawError: true })
  async mintTokens(payload: {
    amount: number
    syntheticName: string
  }): Promise<void> {
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
      const mintTx = await lspContract.create(parsedAmount)
      await mintTx.wait()
      await this.updateContractData()
    }
  }

  @Action({ rawError: true })
  async settleTokens(payload: {
    longTokens: number
    shortTokens: number
    syntheticName: string
  }): Promise<void> {
    const { longTokens, shortTokens, syntheticName } = payload
    console.log(
      `Settling ${longTokens} long and ${shortTokens} short Tokens of ${syntheticName}`
    )
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      const lspContract = lspContracts[syntheticName].connect(signer)
      const parsedLongTokens = ethers.utils.parseUnits(longTokens.toString())
      const parsedShortTokens = ethers.utils.parseUnits(shortTokens.toString())
      console.log("Parsed values: ", {
        lspContract,
        parsedLongTokens,
        parsedShortTokens,
      })
      const settleTx = await lspContract.settle(
        parsedLongTokens,
        parsedShortTokens
      )
      await settleTx.wait()
      await this.updateContractData()
    }
  }

  @Action({ rawError: true })
  async redeemTokens(payload: {
    amount: number
    syntheticName: string
  }): Promise<void> {
    const { amount, syntheticName } = payload
    console.log(`Redeeming ${amount} tokens of ${syntheticName}`)
    const signer = this.context.rootGetters["web3/signer"]
    console.log("Using signer: ", signer)
    if (signer !== undefined) {
      const lspContract = lspContracts[syntheticName].connect(signer)
      const parsedAmount = ethers.utils.parseUnits(amount.toString())
      console.log("Parsed values: ", {
        lspContract,
        parsedAmount,
      })
      const redeemTx = await lspContract.redeem(parsedAmount)
      await redeemTx.wait()
      await this.updateContractData()
    }
  }

  @Action({ rawError: true })
  async updateContractData(): Promise<void> {
    this.context.commit("setTokenBalancesLoaded", false)
    if (this.canUpdate) {
      await this.context.dispatch("updateCollateralTokenBalances")
      await this.context.dispatch("updateSyntheticTokenBalances")
      await this.context.dispatch("updateCollateralAllowances")
      await this.context.dispatch("updateContractStatuses")
      await this.context.dispatch("updateExpiryData")
      this.context.commit("setTokenBalancesLoaded", true)
    }
  }

  @Action({ rawError: true })
  async updateSyntheticTokenBalances(): Promise<void> {
    const selectedAccount = this.context.rootState.web3.selectedAccount
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
  async updateCollateralTokenBalances(): Promise<void> {
    const selectedAccount = this.context.rootState.web3.selectedAccount
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
  async updateCollateralAllowances(): Promise<void> {
    const selectedAccount = this.context.rootState.web3.selectedAccount
    for (const config of this.contractConfigs) {
      const collateralName = config.collateralToken
      const collateralContract = collateralContracts[collateralName]
      const collateralAllowance = await collateralContract.allowance(
        selectedAccount,
        config.address
      )
      this.context.commit("setCollateralAllowance", {
        syntheticName: config.syntheticName,
        collateralAllowance,
      })
    }
  }

  @Action({ rawError: true })
  async updateContractStatuses(): Promise<void> {
    this.context.commit("resetContractStatuses")
    for (const [syntheticName, lspContract] of Object.entries(lspContracts)) {
      const contractState = await lspContract.contractState()
      this.context.commit("setContractStatus", {
        syntheticName,
        status: parseInt(contractState.toString()),
      })
    }
  }

  @Action({ rawError: true })
  async updateExpiryData(): Promise<void> {
    this.context.commit("resetExpiryData")
    for (const [syntheticName, lspContract] of Object.entries(lspContracts)) {
      const percentageLong = parseFloat(
        ethers.utils.formatUnits(await lspContract.expiryPercentLong())
      )
      const price = parseFloat(await lspContract.expiryPrice())
      this.context.commit("setExpiryData", {
        syntheticName,
        data: { percentageLong, price },
      })
    }
  }

  @Action({ rawError: true })
  async initializeContracts(): Promise<void> {
    this.context.commit("resetContractStatuses")
    if (this.canUpdate) {
      console.log("Connecting to contracts")
      const provider = getCurrentProvider()
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
              const collateralAddress =
                addresses[collateralName as keyof typeof addresses]
              const collateralAbi = abis[collateralName as keyof typeof abis]
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

              this.context.commit("setSyntheticTokenAddresses", {
                syntheticName,
                shortAddress,
                longAddress,
              })

              console.log(`Connected to contract ${syntheticName} successfully`)
            } catch (e) {
              console.log(
                `Couldn't connect to contract ${config.syntheticName} due to exception: `,
                e
              )
            }
          }
        }
      }
    }
  }
}
