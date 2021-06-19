/**
 * @jest-environment node
 */

import { ethers, getNamedAccounts } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest"
import { Address } from "hardhat-deploy/dist/types"
import { BigNumber, Contract } from "ethers"
import WETHAbi from "../../abis/WETH.json"
/* import LSPABI from "../../abis/LSP.json" */
import LSPCreatorABI from "../../abis/LSPCreator.json"
/* import ERC20ABI from "../../abis/ERC20.json" */

jest.setTimeout(40000)
expect.extend(waffleJest)

describe("LSP", function () {
  let addresses: Record<string, Address> = {
    WETH: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    LSPCreator: "0x81b0A8206C559a0747D86B4489D0055db4720E84",
    LinearLongShortPairFinancialProductLibrary:
      "0x46b541E0fE2E817340A1A88740607329fF5ED279",
  }
  let contracts: Record<string, Contract> = {}
  let namedAccounts: Record<string, Address>

  const gasprice = 50
  const prepaidProposerReward = ethers.utils.parseUnits("0.01")
  const collateralAmount = ethers.utils.parseUnits("20")
  const numTokens = ethers.utils.parseUnits("10")
  const tokensToTransfer = ethers.utils.parseUnits("3")
  const tokensToKeep = numTokens.sub(tokensToTransfer)
  const tokensToRedeem = ethers.utils.parseUnits("1")

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
    const collateralPerPair = ethers.utils.parseUnits("1")
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
        contracts.WETH.filters.Approval(null, addresses.EMP),
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

    /* const approveTx = await contracts.WETH.approve( */
    /*   addresses.LSP, */
    /*   collateralAmount, */
    /*   transactionOptions */
    /* ) */

    /* const approvePromise = new Promise<void>((resolve) => { */
    /*   contracts.WETH.once( */
    /*     contracts.WETH.filters.Approval(null, addresses.LSP), */
    /*     (_1, _2, allowance) => { */
    /*       expect(allowance).toEqBN(ethers.utils.parseUnits("20")) */
    /*       resolve() */
    /*     } */
    /*   ) */
    /* }) */
    /* await approveTx.wait() */
    /* await approvePromise */
  })

  /* it("Should be able to create a new position providing the required capital", async function () { */
  /*   const oldBalance = await contracts.WETH.balanceOf(namedAccounts.deployer) */

  /*   contracts.LSP = await ethers.getContractAt(LSPABI, addresses.LSP) */

  /*   // Transaction parameters */
  /*   const transactionOptions = { */
  /*     gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI */
  /*     from: namedAccounts.deployer, */
  /*   } */

  /*   // Sends transaction */
  /*   const createTx = await contracts.LSP.create( */
  /*     { rawValue: collateralAmount }, */
  /*     { rawValue: numTokens }, */
  /*     transactionOptions */
  /*   ) */

  /*   const createdPositionPromise = new Promise<void>((resolve) => { */
  /*     contracts.LSP.once( */
  /*       contracts.LSP.filters.PositionCreated(), */
  /*       (sponsor: Address, collateral: BigNumber, tokens: BigNumber) => { */
  /*         expect(sponsor).toEqual(namedAccounts.deployer) */
  /*         expect(collateral).toEqBN(collateralAmount) */
  /*         expect(tokens).toEqBN(numTokens) */
  /*         resolve() */
  /*       } */
  /*     ) */
  /*   }) */

  /*   await createTx.wait() */
  /*   await createdPositionPromise */

  /*   const sponsorCollateral = await contracts.LSP.getCollateral(namedAccounts.deployer) */
  /*   expect(sponsorCollateral[0]).toEqBN(collateralAmount) */

  /*   const newBalance = await contracts.WETH.balanceOf(namedAccounts.deployer) */
  /*   expect(oldBalance.sub(newBalance)).toEqBN(collateralAmount) */
  /* }) */

  /* it("Sponsor receives correct number of synthetic tokens", async function () { */

  /*   addresses.syntheticToken = await contracts.LSP.tokenCurrency() */

  /*   const syntheticTokenContract = await ethers.getContractAt( */
  /*     ERC20ABI, */
  /*     addresses.syntheticToken */
  /*   ) */

  /*   const syntheticBalance = await syntheticTokenContract.balanceOf(namedAccounts.deployer) */
  /*   expect(syntheticBalance).toEqBN(numTokens) */
  /* }) */

  /* it("Sponsor can transfer token", async function () { */

  /*   const syntheticTokenContract = await ethers.getContractAt( */
  /*     ERC20ABI, */
  /*     addresses.syntheticToken */
  /*   ) */

  /*   // Transaction parameters */
  /*   const transactionOptions = { */
  /*     gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI */
  /*     from: namedAccounts.deployer, */
  /*   } */

  /*   const transferTx = await syntheticTokenContract.transfer( */
  /*     namedAccounts.tokenRecipient, */
  /*     tokensToTransfer, */
  /*     transactionOptions */
  /*   ) */

  /*   await transferTx.wait() */

  /*   const syntheticBalanceRecipient = await syntheticTokenContract.balanceOf( */
  /*     namedAccounts.tokenRecipient */
  /*   ) */
  /*   expect(syntheticBalanceRecipient).toEqBN(tokensToTransfer) */

  /*   const syntheticBalanceDeployer = await syntheticTokenContract.balanceOf( */
  /*     namedAccounts.deployer */
  /*   ) */
  /*   expect(syntheticBalanceDeployer).toEqBN(tokensToKeep) */
  /* }) */

  /* it("Sponsor can redeem remaining tokens", async function () { */

  /*   // Transaction parameters */
  /*   const transactionOptions = { */
  /*     gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI */
  /*     from: namedAccounts.deployer, */
  /*   } */

  /*   const syntheticTokenContract = await ethers.getContractAt( */
  /*     ERC20ABI, */
  /*     addresses.syntheticToken */
  /*   ) */

  /*   const oldCollateralBalance = await contracts.WETH.balanceOf(namedAccounts.deployer) */

  /*   const approveTx = await syntheticTokenContract.approve( */
  /*     addresses.LSP, */
  /*     tokensToRedeem, */
  /*     transactionOptions */
  /*   ) */
  /*   await approveTx.wait() */

  /*   const redeemTx = await contracts.LSP.redeem( */
  /*     { rawValue: tokensToRedeem }, */
  /*     transactionOptions */
  /*   ) */

  /*   await redeemTx.wait() */

  /*   const syntheticBalance = await syntheticTokenContract.balanceOf(namedAccounts.deployer) */
  /*   expect(syntheticBalance).toEqBN(tokensToKeep.sub(tokensToRedeem)) */

  /*   const newCollateralBalance = await contracts.WETH.balanceOf(namedAccounts.deployer) */
  /*   const expectedCollateralBalance = oldCollateralBalance.add( */
  /*     tokensToRedeem.mul(collateralizationRatio) */
  /*   ) */
  /*   expect(newCollateralBalance).toEqBN(expectedCollateralBalance) */
  /* }) */
})
