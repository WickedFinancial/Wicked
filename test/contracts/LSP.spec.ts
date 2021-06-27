/**
 * @jest-environment node
 */

import { config, ethers, getNamedAccounts } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest"
import { Address } from "hardhat-deploy/dist/types"
import { BigNumber, Contract } from "ethers"
import WETHAbi from "~/abis/WETH.json"
import LSPABI from "~/abis/LSP.json"
import LSPCreatorABI from "~/abis/LSPCreator.json"
import ERC20ABI from "~/abis/ERC20.json"
import OptimisticOracle from "~/abis/OptomisticOracle.json"
import LinearLongShortPairABI from "~/abis/LinearLongShortPairFinancialProductLibrary.json"

jest.setTimeout(40000)
expect.extend(waffleJest)

describe("LSP", function () {
  const addresses = {
    WETH: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    LSPCreator: "0x4C68829DBD07FEbB250B90f5624d4a5C30BBeC2c",
    LinearLongShortPairFinancialProductLibrary:
      "0x46b541E0fE2E817340A1A88740607329fF5ED279",
    OptimisticOracle: "0xB1d3A89333BBC3F5e98A991d6d4C1910802986BC",
    LSP: "",
    longToken: "",
    shortToken: "",
  }
  let contracts: Record<keyof typeof addresses, Contract>
  let namedAccounts: Record<keyof typeof config.namedAccounts, Address>

  const gasprice = 50
  const prepaidProposerReward = ethers.utils.parseUnits("0.01")
  const collateralAmount = ethers.utils.parseUnits("20")
  const tokensToCreate = ethers.utils.parseUnits("10")
  const tokensToTransfer = ethers.utils.parseUnits("3")
  const collateralPerPair = ethers.utils.parseUnits("1")
  const tokensToKeep = tokensToCreate.sub(tokensToTransfer)
  const tokensToRedeem = ethers.utils.parseUnits("1")
  const tokensToSettle = ethers.utils.parseUnits("1")

  beforeAll(async () => {
    namedAccounts = await getNamedAccounts()

    contracts.WETH = await ethers.getContractAt(WETHAbi, addresses.WETH)
    await contracts.WETH.deposit({
      value: collateralAmount.add(prepaidProposerReward),
      from: namedAccounts.deployer,
    })
  })

  it("should have a deployer with the configured amount of collateral", async () => {
    const balance = await contracts.WETH.balanceOf(namedAccounts.deployer)
    expect(balance).toBeGtBN(collateralAmount)
  })

  it("Should be able to create LSP instance", async function () {
    // This test replicates the behaviour of this script: https://github.com/UMAprotocol/launch-emp/blob/master/index.js

    const lspCreator = await ethers.getContractAt(
      LSPCreatorABI,
      addresses.LSPCreator
    )

    const currTime = Math.floor(Date.now() / 1000)
    const expirationPeriod = 300
    const expirationTime = currTime + expirationPeriod

    // LSP Parameters
    const expirationTimestamp = expirationTime.toString()
    const priceIdentifier = ethers.utils.formatBytes32String("USDETH")
    const syntheticName = "Linear USDETH "
    const syntheticSymbol = "LUSDETH"
    const collateralToken = addresses.WETH
    const financialProductLibrary =
      addresses.LinearLongShortPairFinancialProductLibrary
    const customAncillaryData = ethers.utils.formatBytes32String("")

    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    // Approve transfer of the proposer reward needed at LSP creation time
    const approveTx = await contracts.WETH.approve(
      addresses.LSPCreator,
      prepaidProposerReward,
      transactionOptions
    )

    const approvePromise = new Promise<void>((resolve) => {
      contracts.WETH.once(
        contracts.WETH.filters.Approval(null, addresses.LSP),
        (_1, _2, allowance) => {
          expect(allowance).toEqBN(prepaidProposerReward)
          resolve()
        }
      )
    })
    await approveTx.wait()
    await approvePromise

    const createdLongShortPairPromise = new Promise<void>((resolve) => {
      lspCreator.once(
        lspCreator.filters.CreatedLongShortPair(),
        (address: Address, _) => {
          expect(address).toBeProperAddress()
          addresses.LSP = address
          resolve()
        }
      )
    })

    // Sends transaction
    const tx = await lspCreator.createLongShortPair(
      expirationTimestamp,
      collateralPerPair,
      priceIdentifier,
      syntheticName,
      syntheticSymbol,
      collateralToken,
      financialProductLibrary,
      customAncillaryData,
      prepaidProposerReward,
      transactionOptions
    )
    tx.wait()

    await createdLongShortPairPromise
  })

  it("Should be able configure Linear LSP Library", async function () {
    const lowerBound = "2000"
    const upperBound = "3000"
    contracts.LinearLongShortPairFinancialProductLibrary = await ethers.getContractAt(
      LinearLongShortPairABI,
      addresses.LinearLongShortPairFinancialProductLibrary
    )

    await contracts.LinearLongShortPairFinancialProductLibrary.setLongShortPairParameters(
      addresses.LSP,
      upperBound,
      lowerBound
    )

    const parameters = await contracts.LinearLongShortPairFinancialProductLibrary.longShortPairParameters(
      addresses.LSP
    )
    expect(parameters[0].toString()).toEqual(upperBound)
    expect(parameters[1].toString()).toEqual(lowerBound)
  })

  it("Should be able to create a new position providing the required capital", async function () {
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    // Approve collateral amount to use for minting LSP tokens
    const approveTx = await contracts.WETH.approve(
      addresses.LSP,
      collateralAmount,
      transactionOptions
    )

    const approvePromise = new Promise<void>((resolve) => {
      contracts.WETH.once(
        contracts.WETH.filters.Approval(null, addresses.LSP),
        (_1, _2, allowance) => {
          expect(allowance).toEqBN(ethers.utils.parseUnits("20"))
          resolve()
        }
      )
    })
    await approveTx.wait()
    await approvePromise

    const oldBalance = await contracts.WETH.balanceOf(namedAccounts.deployer)

    contracts.LSP = await ethers.getContractAt(LSPABI, addresses.LSP)

    // Sends transaction
    const createTx = await contracts.LSP.create(
      tokensToCreate,
      transactionOptions
    )

    const createdPositionPromise = new Promise<void>((resolve) => {
      contracts.LSP.once(
        contracts.LSP.filters.TokensCreated(),
        (sponsor: Address, collateral: BigNumber, tokens: BigNumber) => {
          expect(sponsor).toEqual(namedAccounts.deployer)
          expect(collateral).toEqBN(tokensToCreate)
          expect(tokens).toEqBN(tokensToCreate)
          resolve()
        }
      )
    })

    await createTx.wait()
    await createdPositionPromise

    const positionTokens = await contracts.LSP.getPositionTokens(
      namedAccounts.deployer
    )
    expect(positionTokens[0]).toEqBN(tokensToCreate)

    const newBalance = await contracts.WETH.balanceOf(namedAccounts.deployer)
    expect(oldBalance.sub(newBalance)).toEqBN(tokensToCreate)
  })

  it("Sponsor receives correct number of long tokens", async function () {
    addresses.longToken = await contracts.LSP.longToken()

    contracts.longToken = await ethers.getContractAt(
      ERC20ABI,
      addresses.longToken
    )

    const syntheticBalance = await contracts.longToken.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalance).toEqBN(tokensToCreate)
  })

  it("Sponsor receives correct number of short tokens", async function () {
    addresses.shortToken = await contracts.LSP.shortToken()

    contracts.shortToken = await ethers.getContractAt(
      ERC20ABI,
      addresses.shortToken
    )

    const syntheticBalance = await contracts.shortToken.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalance).toEqBN(tokensToCreate)
  })

  it("Sponsor can transfer long token", async function () {
    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    const transferTx = await contracts.longToken.transfer(
      namedAccounts.tokenRecipient,
      tokensToTransfer,
      transactionOptions
    )

    await transferTx.wait()

    const syntheticBalanceRecipient = await contracts.longToken.balanceOf(
      namedAccounts.tokenRecipient
    )
    expect(syntheticBalanceRecipient).toEqBN(tokensToTransfer)

    const syntheticBalanceDeployer = await contracts.longToken.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalanceDeployer).toEqBN(tokensToKeep)
  })
  it("Sponsor can redeem some tokens", async function () {
    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      gasLimit: 12000000,
      from: namedAccounts.deployer,
    }

    const oldCollateralBalance = await contracts.WETH.balanceOf(
      namedAccounts.deployer
    )

    // Check that sponsor still has enough L / S Tokens
    const syntheticBalances = await contracts.LSP.getPositionTokens(
      namedAccounts.deployer
    )
    expect(syntheticBalances[0]).toBeGteBN(tokensToRedeem)
    expect(syntheticBalances[1]).toBeGteBN(tokensToRedeem)

    // Check contract state
    const contractState = await contracts.LSP.contractState()
    const openState = 0
    expect(contractState).toEqual(openState)

    const redeemTx = await contracts.LSP.redeem(
      tokensToRedeem,
      transactionOptions
    )

    await redeemTx.wait()
    const newCollateralBalance = await contracts.WETH.balanceOf(
      namedAccounts.deployer
    )
    const expectedCollateralBalance = oldCollateralBalance.add(tokensToRedeem)
    expect(newCollateralBalance).toEqBN(expectedCollateralBalance)
  })
  it("Should change state to ExpiredPriceRequested after expire", async function () {
    // Check that sponsor still has enough L / S Tokens
    const syntheticBalances = await contracts.LSP.getPositionTokens(
      namedAccounts.deployer
    )
    expect(syntheticBalances[0]).toBeGteBN(tokensToSettle)
    expect(syntheticBalances[1]).toBeGteBN(tokensToSettle)

    // Check contract state
    const ContractState = {
      Open: 0,
      ExpiredPriceRequested: 1,
      ExpiredPriceReceived: 2,
    }

    let contractState: number = await contracts.LSP.contractState()

    expect(contractState).toEqual(ContractState.Open)

    // fast forward 350 seconds
    await ethers.provider.send("evm_increaseTime", [350])
    await ethers.provider.send("evm_mine", [])

    // expire the contract
    const expireTx = await contracts.LSP.expire()

    await expireTx.wait()
    contractState = await contracts.LSP.contractState()

    expect(contractState).toEqual(ContractState.ExpiredPriceRequested)
  })

  it("Should change the contract state after calling expire", async function () {
    // Check that sponsor still has enough L / S Tokens
    const syntheticBalances = await contracts.LSP.getPositionTokens(
      namedAccounts.deployer
    )
    expect(syntheticBalances[0]).toBeGteBN(tokensToSettle)
    expect(syntheticBalances[1]).toBeGteBN(tokensToSettle)

    // Check contract state
    enum ContractState {
      Open,
      ExpiredPriceRequested,
      ExpiredPriceReceived,
    }

    let contractState: number = await contracts.LSP.contractState()

    expect(contractState).toEqual(ContractState.Open)

    // fast forward 350 seconds
    await ethers.provider.send("evm_increaseTime", [350])
    await ethers.provider.send("evm_mine", [])

    // expire the contract
    const expireTx = await contracts.LSP.expire()

    await expireTx.wait()
    contractState = await contracts.LSP.contractState()

    expect(contractState).toEqual(ContractState.ExpiredPriceRequested)
  })
  it("Should settle tokens after receiving expired price. ", async () => {
    contracts.OptimisticOracle = await ethers.getContractAt(
      OptimisticOracle,
      addresses.OptimisticOracle
    )
  })
})
