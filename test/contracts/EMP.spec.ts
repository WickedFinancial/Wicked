/**
 * @jest-environment node
 */

import { ethers, getNamedAccounts } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest"
import { Address } from "hardhat-deploy/dist/types"
import { BigNumber, Contract } from "ethers"
import WETHAbi from "~/abis/WETH.json"
import EMPABI from "~/abis/EMP.json"
import EMPCreatorABI from "~/abis/EMPCreator.json"
import ERC20ABI from "~/abis/ERC20.json"

jest.setTimeout(40000)
expect.extend(waffleJest)

describe("EMP", function () {
  const addresses: Record<string, Address> = {
    WETH: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
  }
  const contracts: Record<string, Contract> = {}
  let namedAccounts: Record<string, Address>

  const gasprice = 50
  const collateralAmount = ethers.utils.parseUnits("20")
  const numTokens = ethers.utils.parseUnits("10")
  const collateralizationRatio = collateralAmount.div(numTokens)
  const tokensToTransfer = ethers.utils.parseUnits("3")
  const tokensToKeep = numTokens.sub(tokensToTransfer)
  const tokensToRedeem = ethers.utils.parseUnits("1")

  beforeAll(async () => {
    namedAccounts = await getNamedAccounts()

    contracts.WETH = await ethers.getContractAt(WETHAbi, addresses.WETH)
    await contracts.WETH.deposit({
      value: collateralAmount,
      from: namedAccounts.deployer,
    })
  })

  it("should have a deployer with the configured amount of collateral", async () => {
    const balance = await contracts.WETH.balanceOf(namedAccounts.deployer)
    expect(balance).toBeGtBN(collateralAmount)
  })

  it("Should be able to create EMP instance", async function () {
    // This test replicates the behaviour of this script: https://github.com/UMAprotocol/launch-emp/blob/master/index.js

    const address = "0x9a689BfD9f3a963b20d5ba4Ed7ed0b7bE16CfCcB"
    const empCreator = await ethers.getContractAt(EMPCreatorABI, address)

    const currTime = Math.floor(Date.now() / 1000)
    const expirationPeriod = 300
    const expirationTime = currTime + expirationPeriod

    const priceFeedIdentifier =
      "0x5553444554480000000000000000000000000000000000000000000000000000" // "USDETH"
    const expirationTimestamp = expirationTime.toString()
    const syntheticName = "Yield Dollar [WETH Jan 2022]"
    const syntheticSymbol = "YD-ETH-JAN22"
    const minSponsorTokens = "5"
    const libraryAddress = "0x0000000000000000000000000000000000000000"

    // EMP Parameters. Pass in arguments to customize these.
    const empParams = {
      expirationTimestamp, // Timestamp that the contract will expire at.
      collateralAddress: addresses.WETH, // Collateral token address.
      syntheticName, // Long name.
      syntheticSymbol, // Short name.
      priceFeedIdentifier,
      collateralRequirement: { rawValue: ethers.utils.parseUnits("1.25") }, // 125% collateral req.
      disputeBondPercentage: { rawValue: ethers.utils.parseUnits("0.1") }, // 10% dispute bond.
      sponsorDisputeRewardPercentage: {
        rawValue: ethers.utils.parseUnits("0.05"),
      }, // 5% reward for sponsors who are disputed invalidly
      disputerDisputeRewardPercentage: {
        rawValue: ethers.utils.parseUnits("0.2"),
      }, // 20% reward for correct disputes.
      minSponsorTokens: { rawValue: ethers.utils.parseUnits(minSponsorTokens) }, // Minimum sponsor position size.
      liquidationLiveness: 7200, // 2 hour liquidation liveness.
      withdrawalLiveness: 7200, // 2 hour withdrawal liveness.
      financialProductLibraryAddress: libraryAddress, // Default to 0x0 if no address is passed.
    }

    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    const createdExpiringMultiPartyPromise = new Promise<void>((resolve) => {
      empCreator.once(
        empCreator.filters.CreatedExpiringMultiParty(),
        (address: Address, _) => {
          expect(address).toBeProperAddress()
          addresses.EMP = address
          resolve()
        }
      )
    })

    // Sends transaction
    const tx = await empCreator.createExpiringMultiParty(
      empParams,
      transactionOptions
    )
    tx.wait()

    await createdExpiringMultiPartyPromise

    const approveTx = await contracts.WETH.approve(
      addresses.EMP,
      collateralAmount,
      transactionOptions
    )

    const approvePromise = new Promise<void>((resolve) => {
      contracts.WETH.once(
        contracts.WETH.filters.Approval(null, addresses.EMP),
        (_1, _2, allowance) => {
          expect(allowance).toEqBN(ethers.utils.parseUnits("20"))
          resolve()
        }
      )
    })
    await approveTx.wait()
    await approvePromise
  })

  it("Should be able to create a new position providing the required capital", async function () {
    const oldBalance = await contracts.WETH.balanceOf(namedAccounts.deployer)

    contracts.EMP = await ethers.getContractAt(EMPABI, addresses.EMP)

    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    // Sends transaction
    const createTx = await contracts.EMP.create(
      { rawValue: collateralAmount },
      { rawValue: numTokens },
      transactionOptions
    )

    const createdPositionPromise = new Promise<void>((resolve) => {
      contracts.EMP.once(
        contracts.EMP.filters.PositionCreated(),
        (sponsor: Address, collateral: BigNumber, tokens: BigNumber) => {
          expect(sponsor).toEqual(namedAccounts.deployer)
          expect(collateral).toEqBN(collateralAmount)
          expect(tokens).toEqBN(numTokens)
          resolve()
        }
      )
    })

    await createTx.wait()
    await createdPositionPromise

    const sponsorCollateral = await contracts.EMP.getCollateral(
      namedAccounts.deployer
    )
    expect(sponsorCollateral[0]).toEqBN(collateralAmount)

    const newBalance = await contracts.WETH.balanceOf(namedAccounts.deployer)
    expect(oldBalance.sub(newBalance)).toEqBN(collateralAmount)
  })

  it("Sponsor receives correct number of synthetic tokens", async function () {
    addresses.syntheticToken = await contracts.EMP.tokenCurrency()

    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      addresses.syntheticToken
    )

    const syntheticBalance = await syntheticTokenContract.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalance).toEqBN(numTokens)
  })

  it("Sponsor can transfer token", async function () {
    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      addresses.syntheticToken
    )

    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    const transferTx = await syntheticTokenContract.transfer(
      namedAccounts.tokenRecipient,
      tokensToTransfer,
      transactionOptions
    )

    await transferTx.wait()

    const syntheticBalanceRecipient = await syntheticTokenContract.balanceOf(
      namedAccounts.tokenRecipient
    )
    expect(syntheticBalanceRecipient).toEqBN(tokensToTransfer)

    const syntheticBalanceDeployer = await syntheticTokenContract.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalanceDeployer).toEqBN(tokensToKeep)
  })

  it("Sponsor can redeem remaining tokens", async function () {
    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      addresses.syntheticToken
    )

    const oldCollateralBalance = await contracts.WETH.balanceOf(
      namedAccounts.deployer
    )

    const approveTx = await syntheticTokenContract.approve(
      addresses.EMP,
      tokensToRedeem,
      transactionOptions
    )
    await approveTx.wait()

    const redeemTx = await contracts.EMP.redeem(
      { rawValue: tokensToRedeem },
      transactionOptions
    )

    await redeemTx.wait()

    const syntheticBalance = await syntheticTokenContract.balanceOf(
      namedAccounts.deployer
    )
    expect(syntheticBalance).toEqBN(tokensToKeep.sub(tokensToRedeem))

    const newCollateralBalance = await contracts.WETH.balanceOf(
      namedAccounts.deployer
    )
    const expectedCollateralBalance = oldCollateralBalance.add(
      tokensToRedeem.mul(collateralizationRatio)
    )
    expect(newCollateralBalance).toEqBN(expectedCollateralBalance)
  })
})
