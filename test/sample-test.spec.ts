/**
 * @jest-environment node
 */

import { ethers, getNamedAccounts } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest"
import WETHAbi from "../abis/WETH.json"
import EMPABI from "../abis/EMP.json"
import EMPCreatorABI from "../abis/EMPCreator.json"

jest.setTimeout(40000)
expect.extend(waffleJest)

async function setup() {
  const { deployer } = await getNamedAccounts()
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
  return { ...contracts, deployer }
}

describe("EMP", function () {
  it("should have a deployer with at least 20 WETH", async () => {
    const { WETH, deployer } = await setup()
    const balance = await WETH.balanceOf(deployer)
    expect(
      parseFloat(ethers.utils.formatUnits(balance))
    ).toBeGreaterThanOrEqual(20)
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
    const minSponsorTokens = "10"
    const libraryAddress = "0x0000000000000000000000000000000000000000"
    const gasprice = 50

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

    // Simulate transaction to test before sending to the network.
    const empAddress = await empCreator.createExpiringMultiParty(
      empParams,
      transactionOptions
    )
    console.log(empAddress)

    // await WETH.approve(
    //   empAddress.hash,
    //   ethers.utils.parseUnits("20"),
    //   transactionOptions
    // )
  })
})
