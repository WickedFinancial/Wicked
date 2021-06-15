/**
 * @jest-environment node
 */

import { ethers, getNamedAccounts } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest"
import { Address } from "hardhat-deploy/dist/types"
import { BigNumber } from "ethers"
import WETHAbi from "../abis/WETH.json"
import EMPABI from "../abis/EMP.json"
import EMPCreatorABI from "../abis/EMPCreator.json"

// Human readable ethers abi: https://docs.ethers.io/v5/api/contract/example/
const ERC20ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (boolean)",
  "function approve(address spender, uint amount) returns (boolean)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
]

jest.setTimeout(40000)
expect.extend(waffleJest)

async function setup() {
  const { deployer, tokenRecipient } = await getNamedAccounts()
  const contracts = {
    WETH: await ethers.getContractAt(
      WETHAbi,
      "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
    ),
  }
  await contracts.WETH.deposit({
    value: ethers.utils.parseUnits("20"),
    from: deployer,
  })
  return { ...contracts, deployer, tokenRecipient }
}

describe("EMP", function () {
  let empAddress: Address
  let tokenCurrencyAddress: Address
  const gasprice = 50
  const collateralAmount = ethers.utils.parseUnits("20")
  const numTokens = ethers.utils.parseUnits("10")
  const collateralizationRatio = collateralAmount.div(numTokens)
  const tokensToTransfer = ethers.utils.parseUnits("3")
  const tokensToKeep = numTokens.sub(tokensToTransfer)
  const tokensToRedeem = ethers.utils.parseUnits("1")

  it("should have a deployer with at least 20 WETH", async () => {
    const { WETH, deployer } = await setup()
    const balance = await WETH.balanceOf(deployer)
    expect(balance).toBeGtBN(ethers.utils.parseUnits("20"))
  })
  it("Should be able to create EMP instance", async function () {
    const { WETH, deployer } = await setup()
    // This test replicates the behaviour of this script: https://github.com/UMAprotocol/launch-emp/blob/master/index.js

    const address = "0x9a689BfD9f3a963b20d5ba4Ed7ed0b7bE16CfCcB"
    const empCreator = await ethers.getContractAt(EMPCreatorABI, address)

    const currTime = Math.floor(Date.now() / 1000)
    const expirationPeriod = 300
    const expirationTime = currTime + expirationPeriod

    const priceFeedIdentifier = "USDETH"
    const expirationTimestamp = expirationTime.toString()
    const syntheticName = "Yield Dollar [WETH Jan 2022]"
    const syntheticSymbol = "YD-ETH-JAN22"
    const minSponsorTokens = "5"
    const libraryAddress = "0x0000000000000000000000000000000000000000"

    // EMP Parameters. Pass in arguments to customize these.
    const empParams = {
      expirationTimestamp, // Timestamp that the contract will expire at.
      collateralAddress: WETH.address, // Collateral token address.
      syntheticName, // Long name.
      syntheticSymbol, // Short name.
      priceFeedIdentifier:
        "0x5553444554480000000000000000000000000000000000000000000000000000",
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
      from: deployer,
    }

    const createdExpiringMultiPartyPromise = new Promise<void>((resolve) => {
      empCreator.once(
        empCreator.filters.CreatedExpiringMultiParty(),
        (address: Address, _) => {
          expect(address).toBeProperAddress()
          empAddress = address
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

    const approveTx = await WETH.approve(
      empAddress,
      ethers.utils.parseUnits("20"),
      transactionOptions
    )

    const approvePromise = new Promise<void>((resolve) => {
      WETH.once(
        WETH.filters.Approval(null, empAddress),
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
    const { WETH, deployer } = await setup()
    const oldBalance = await WETH.balanceOf(deployer)

    const empContract = await ethers.getContractAt(EMPABI, empAddress)

    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: deployer,
    }

    // Sends transaction
    const createTx = await empContract.create(
      { rawValue: collateralAmount },
      { rawValue: numTokens },
      transactionOptions
    )

    const createdPositionPromise = new Promise<void>((resolve) => {
      empContract.once(
        empContract.filters.PositionCreated(),
        (sponsor: Address, collateral: BigNumber, tokens: BigNumber) => {
          expect(sponsor).toEqual(deployer)
          expect(collateral).toEqBN(collateralAmount)
          expect(tokens).toEqBN(numTokens)
          resolve()
        }
      )
    })

    await createTx.wait()
    await createdPositionPromise

    const sponsorCollateral = await empContract.getCollateral(deployer)
    expect(sponsorCollateral[0]).toEqBN(collateralAmount)

    const newBalance = await WETH.balanceOf(deployer)
    expect(oldBalance.sub(newBalance)).toEqBN(collateralAmount)
  })

  it("Sponsor receives correct number of synthetic tokens", async function () {
    const { deployer } = await setup()
    const empContract = await ethers.getContractAt(EMPABI, empAddress)

    tokenCurrencyAddress = await empContract.tokenCurrency()

    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      tokenCurrencyAddress
    )

    const syntheticBalance = await syntheticTokenContract.balanceOf(deployer)
    expect(syntheticBalance).toEqBN(numTokens)
  })

  it("Sponsor can transfer token", async function () {
    const { deployer, tokenRecipient } = await setup()

    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      tokenCurrencyAddress
    )

    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: deployer,
    }

    const transferTx = await syntheticTokenContract.transfer(
      tokenRecipient,
      tokensToTransfer,
      transactionOptions
    )

    await transferTx.wait()

    const syntheticBalanceRecipient = await syntheticTokenContract.balanceOf(
      tokenRecipient
    )
    expect(syntheticBalanceRecipient).toEqBN(tokensToTransfer)

    const syntheticBalanceDeployer = await syntheticTokenContract.balanceOf(
      deployer
    )
    expect(syntheticBalanceDeployer).toEqBN(tokensToKeep)
  })

  it("Sponsor can redeem remaining tokens", async function () {
    const { deployer, WETH } = await setup()

    // Transaction parameters
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: deployer,
    }

    const empContract = await ethers.getContractAt(EMPABI, empAddress)
    const syntheticTokenContract = await ethers.getContractAt(
      ERC20ABI,
      tokenCurrencyAddress
    )

    const oldCollateralBalance = await WETH.balanceOf(deployer)

    const approveTx = await syntheticTokenContract.approve(
      empAddress,
      tokensToRedeem,
      transactionOptions
    )
    await approveTx.wait()

    const redeemTx = await empContract.redeem(
      { rawValue: tokensToRedeem },
      transactionOptions
    )

    await redeemTx.wait()

    const syntheticBalance = await syntheticTokenContract.balanceOf(deployer)
    expect(syntheticBalance).toEqBN(tokensToKeep.sub(tokensToRedeem))

    const newCollateralBalance = await WETH.balanceOf(deployer)
    const expectedCollateralBalance = oldCollateralBalance.add(
      tokensToRedeem.mul(collateralizationRatio)
    )
    expect(newCollateralBalance).toEqBN(expectedCollateralBalance)
  })
})
