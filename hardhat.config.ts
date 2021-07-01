/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import "hardhat-deploy"
import fs from "fs"
import { readdir, readFile, writeFile } from "fs/promises"
import { HardhatUserConfig } from "hardhat/types"
import { subtask, task, types } from "hardhat/config"
import { Contract } from "ethers"
import addresses from "./addresses.json"
import * as abis from "./abis"
import contractConfigs from "./contractConfigs.json"
import deployedContractConfigs from "./deployedContractConfigs.json"

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim()
  } catch (e) {
    console.log("WARNING: No mnemonic file")
  }
  return ""
}

function url() {
  try {
    return fs.readFileSync("./url.txt").toString().trim()
  } catch (e) {
    console.log("WARNING: No url file")
  }
  return ""
}

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  namedAccounts: {
    deployer: 0,
    tokenRecipient: 1,
  },
  networks: {
    hardhat: {
      forking: {
        url: url(),
      },
      chainId: 42,
    },
    kovan: {
      url: url(),
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
}
export default config

task(
  "convert",
  "Convert all json abis to human readable format",
  async (_, { ethers }) => {
    const path = "./abis/"
    const files = await readdir(path)
    for (const file of files) {
      if (file === "index.ts") continue
      const jsonBuffer = await readFile(path.concat(file))
      const jsonAbi = JSON.parse(jsonBuffer.toString())
      const iface = new ethers.utils.Interface(jsonAbi)
      const readableAbi = iface.format(ethers.utils.FormatTypes.full)
      console.log("Readable Abi: ", readableAbi)
      await writeFile(path.concat(file), JSON.stringify(readableAbi, null, 2))
    }
  }
)

task("collateral", "Mint Collateral Tokens for use in tests")
  .addOptionalParam("collateralName", "Name of Collateral to mint", "WETH")
  .addOptionalParam(
    "amount",
    "Amount of Ether for which to generate collateral",
    "10"
  )
  .addOptionalParam(
    "gasprice",
    "Gas Price to use in transactions",
    50 * 100000000,
    types.int
  )
  .setAction(
    async (
      { collateralName, amount, gasprice },
      { ethers, getNamedAccounts, run }
    ) => {
      if (collateralName === "LUSD") {
        await run("LUSD", { amount })
      } else {
        const collateralContract = await ethers.getContractAt(
          abis[collateralName as keyof typeof abis],
          addresses[collateralName as keyof typeof addresses]
        )

        const namedAccounts = await getNamedAccounts()
        const transactionOptions = {
          gasPrice: gasprice, // gasprice arg * 1 GWEI
          from: namedAccounts.deployer,
          value: ethers.utils.parseUnits(amount),
        }
        const depositTx = await collateralContract.deposit(transactionOptions)
        await depositTx.wait()
        console.log(`Deposited ${amount} in ${collateralName}`)
      }
    }
  )
subtask("LUSD", "mint lusd")
  .addParam("amount", "Amount of Ether for which to generate collateral", "10")
  .setAction(async ({ amount }, { ethers, getNamedAccounts }) => {
    const namedAccounts = await getNamedAccounts()
    const transactionOptions = {
      from: namedAccounts.deployer,
      value: ethers.utils.parseUnits(amount),
    }
    const borrowerOperations = await ethers.getContractAt(
      abis.BorrowerOperations,
      addresses.BorrowerOperations
    )

    // Todo : implement getting real hints https://github.com/liquity/dev#example-borrower-operations-with-hints
    const openTroveTx = await borrowerOperations.openTrove(
      ethers.utils.parseUnits(".75"),
      ethers.utils.parseUnits("2000"),
      namedAccounts.deployer,
      namedAccounts.deployer,
      transactionOptions
    )
    await openTroveTx.wait()
  })

task("synthetic", "Mint Synthetic Tokens for use in tests")
  .addParam("syntheticName", "Name of Synthetic to mint")
  .addOptionalParam("amount", "Amount of synthetic tokens to mint", "1")
  .addOptionalParam(
    "gasprice",
    "Gas Price to use in transactions",
    50 * 100000000,
    types.int
  )
  .setAction(
    async (
      { syntheticName, amount, gasprice },
      { ethers, getNamedAccounts }
    ) => {
      const contractConfig = deployedContractConfigs.find(
        (config) => config.syntheticName === syntheticName
      )
      if (contractConfig !== undefined) {
        const namedAccounts = await getNamedAccounts()
        const transactionOptions = {
          gasPrice: gasprice, // gasprice arg * 1 GWEI
          from: namedAccounts.deployer,
        }
        const LSPContract = await ethers.getContractAt(
          abis.LSP,
          contractConfig.address || ""
        )

        // Approve Collateral
        const necessaryCollateral = ethers.utils.parseUnits(
          (
            parseFloat(amount) * parseFloat(contractConfig.collateralPerPair)
          ).toString()
        )
        type AddressKey = keyof typeof addresses
        const tokenKey = contractConfig.collateralToken as AddressKey
        const collateralAddress = addresses[tokenKey]
        const collateralAbi = abis[tokenKey]
        console.log("Collateral Address: ", collateralAddress)
        const collateralContract = await ethers.getContractAt(
          collateralAbi,
          collateralAddress || ""
        )

        const approveTx = await collateralContract.approve(
          contractConfig.address,
          necessaryCollateral,
          transactionOptions
        )
        await approveTx.wait()
        console.log(
          `Approve tx for ${necessaryCollateral.toString()} of collateral`,
          approveTx
        )

        // Sends transaction
        const createTx = await LSPContract.create(
          ethers.utils.parseUnits(amount),
          transactionOptions
        )
        await createTx.wait()

        console.log(`Create tx for ${amount} of tokens`, createTx)
      }
    }
  )

task("launch", "Launch all configured LSP contracts")
  .addOptionalParam(
    "gasprice",
    "Gas Price to use in transactions",
    50 * 100000000,
    types.int
  )
  .setAction(async ({ gasprice }, { ethers, getNamedAccounts, run }) => {
    const LSPCreator = await ethers.getContractAt(
      abis.LSPCreator,
      addresses.LSPCreator
    )
    const namedAccounts = await getNamedAccounts()
    const transactionOptions = {
      gasPrice: gasprice, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    const contracts: Record<string, Contract> = { LSPCreator }

    for (const contractConfiguration of contractConfigs as Array<
      Record<any, any>
    >) {
      try {
        console.log(contractConfiguration)
        type AddressKey = keyof typeof addresses
        const collateralTokenKey = <AddressKey>(
          contractConfiguration.collateralToken
        )
        const libraryKey = <AddressKey>(
          contractConfiguration.financialProductLibrary
        )
        // Parse Contract configuration values
        const expirationTimestamp = Math.floor(
          new Date(contractConfiguration.expirationTime).getTime() / 1000
        ).toString()
        const priceIdentifier = ethers.utils.formatBytes32String(
          contractConfiguration.priceIdentifier
        )
        const collateralPerPair = ethers.utils.parseUnits(
          contractConfiguration.collateralPerPair
        )
        const syntheticName = contractConfiguration.syntheticName
        const syntheticSymbol = contractConfiguration.syntheticSymbol
        const collateralTokenAddress = addresses[collateralTokenKey]
        const financialProductLibraryAddress = addresses[libraryKey]
        const customAncillaryData = ethers.utils.formatBytes32String(
          contractConfiguration.customAncillaryData
        )
        const prepaidProposerReward = ethers.utils.parseUnits(
          contractConfiguration.prepaidProposerReward
        )

        // Get Collateral Contract instance if not present already
        if (!(contractConfiguration.collateralToken in contracts)) {
          contracts[collateralTokenKey] = await ethers.getContractAt(
            abis[collateralTokenKey],
            collateralTokenAddress
          )
        }

        // Create and Approve collateral for the proposer reward
        const collateralContract =
          contracts[contractConfiguration.collateralToken]

        if (contractConfiguration.collateralToken === "LUSD") {
          await run("LUSD", { amount: "10" })
        } else {
          const depositTx = await collateralContract.deposit({
            value: prepaidProposerReward.mul(
              contractConfiguration.collateralPriceInEth
            ),
            ...transactionOptions,
          })
          await depositTx.wait()
          console.log(
            `Deposited ${prepaidProposerReward} in ${contractConfiguration.collateralToken}`
          )
        }

        const approveTx = await collateralContract.approve(
          addresses.LSPCreator,
          prepaidProposerReward,
          transactionOptions
        )
        await approveTx.wait()
        console.log(
          `Approved ${prepaidProposerReward} in ${contractConfiguration.collateralToken}`
        )

        // Launch LSP
        console.log(`Simulating deploying ${syntheticName} to retrieve address`)
        const lspAddress = await LSPCreator.callStatic.createLongShortPair(
          expirationTimestamp,
          collateralPerPair,
          priceIdentifier,
          syntheticName,
          syntheticSymbol,
          collateralTokenAddress,
          financialProductLibraryAddress,
          customAncillaryData,
          prepaidProposerReward,
          transactionOptions
        )

        console.log(`Deploying  ${syntheticName} to address ${lspAddress}`)

        const launchTx = await LSPCreator.createLongShortPair(
          expirationTimestamp,
          collateralPerPair,
          priceIdentifier,
          syntheticName,
          syntheticSymbol,
          collateralTokenAddress,
          financialProductLibraryAddress,
          customAncillaryData,
          prepaidProposerReward,
          transactionOptions
        )
        contractConfiguration.address = lspAddress as string

        console.log(
          `Deployed contract ${syntheticName} to address ${contractConfiguration.address} in transaction: ${launchTx.hash}`
        )

        // Configure Financial ProductLibrary
        // Get Financial Product Library instance if not present already
        if (!(contractConfiguration.financialProductLibrary in contracts)) {
          contracts[libraryKey] = await ethers.getContractAt(
            abis[libraryKey],
            financialProductLibraryAddress
          )
        }

        // Set Parameters
        const financialProductLibraryContract =
          contracts[contractConfiguration.financialProductLibrary]

        await financialProductLibraryContract.setLongShortPairParameters(
          lspAddress,
          ethers.utils.parseUnits(
            contractConfiguration.financialProductLibraryParameters[0]
          ),
          ethers.utils.parseUnits(
            contractConfiguration.financialProductLibraryParameters[1]
          ),
          transactionOptions
        )
        console.log(
          `Set the parameters to ${contractConfiguration.financialProductLibraryParameters} for ${contractConfiguration.financialProductLibrary} of contract ${syntheticName}`
        )

        contractConfiguration.success = true
      } catch (e) {
        console.log(
          `FAILED to deploy contract ${contractConfiguration.syntheticName}`,
          e
        )
        contractConfiguration.success = false
        contractConfiguration.error = e.toString()
      }
    }
    const outputFile = "./deployedContractConfigs.json"
    await writeFile(outputFile, JSON.stringify(contractConfigs, null, 2))
  })

task("time:expiry", "Set time to expiry date of given contract")
  .addParam(
    "syntheticName",
    "Name of the contract whose expiration time you want to travel to / past"
  )
  .setAction(async ({ syntheticName }, { ethers }) => {
    const contractConfig = deployedContractConfigs.find(
      (config) => config.syntheticName === syntheticName
    )
    if (contractConfig !== undefined) {
      const expirationTime = contractConfig.expirationTime
      console.log("Traveling to expiration time: ", expirationTime)
      const timeStamp = new Date(expirationTime).getTime() / 1000
      await ethers.provider.send("evm_setNextBlockTimestamp", [timeStamp + 1])
      await ethers.provider.send("evm_mine", [])
    }
  })

task(
  "time:dispute",
  "Advances time by the default dispute liveness value"
).setAction(async (_, { ethers }) => {
  const optimisticOracle = await ethers.getContractAt(
    abis.OptimisticOracle,
    addresses.OptimisticOracle
  )
  const defaultLiveness = await optimisticOracle.defaultLiveness()

  console.log("Default Liveness: ", defaultLiveness.toNumber())

  await ethers.provider.send("evm_increaseTime", [defaultLiveness.toNumber()])
})

task("settle:oracle", "Settle on oracle")
  .addParam(
    "syntheticName",
    "Name of the contract for which you want to propose a settlement price"
  )
  .setAction(async ({ syntheticName }, { ethers }) => {
    const contractConfig = deployedContractConfigs.find(
      (config) => config.syntheticName === syntheticName
    )
    if (contractConfig !== undefined) {
      const optimisticOracle = await ethers.getContractAt(
        abis.OptimisticOracle,
        addresses.OptimisticOracle
      )

      // Send Settlement Transaction
      const requester = contractConfig.address
      const identifier = ethers.utils.formatBytes32String(
        contractConfig.priceIdentifier
      )
      const timestamp = Math.floor(
        new Date(contractConfig.expirationTime).getTime() / 1000
      ).toString()
      const ancillaryData = ethers.utils.formatBytes32String(
        contractConfig.customAncillaryData
      )

      const settleTx = await optimisticOracle.settle(
        requester,
        identifier,
        timestamp,
        ancillaryData
      )
      await settleTx.wait()
      console.log("Settled on Oracle")
    }
  })

task("settle:lsp", "Settle on lsp contract")
  .addParam(
    "syntheticName",
    "Name of the contract for which you want to settle tokens"
  )
  .addOptionalParam("longTokens", "Amount of long tokens to redeem", "0")
  .addOptionalParam("shortTokens", "Amount of short tokens to redeem", "0")
  .setAction(async ({ longTokens, shortTokens, syntheticName }, { ethers }) => {
    const contractConfig = deployedContractConfigs.find(
      (config) => config.syntheticName === syntheticName
    )
    if (contractConfig !== undefined) {
      const lspContract = await ethers.getContractAt(
        abis.LSP,
        contractConfig.address || "NOADDRESS"
      )
      const longTokensParsed = ethers.utils.parseUnits(longTokens)
      const shortTokensParsed = ethers.utils.parseUnits(shortTokens)
      const settleTx = await lspContract.settle(
        longTokensParsed,
        shortTokensParsed
      )
      await settleTx.wait()
    }
  })

task("propose", "Propose price for given contract")
  .addParam(
    "syntheticName",
    "Name of the contract for which you want to propose a settlement price"
  )
  .addParam("proposedPrice", "Price value to propose")
  .setAction(async ({ syntheticName, proposedPrice }, { ethers }) => {
    const contractConfig = deployedContractConfigs.find(
      (config) => config.syntheticName === syntheticName
    )
    if (contractConfig !== undefined) {
      const optimisticOracle = await ethers.getContractAt(
        abis.OptimisticOracle,
        addresses.OptimisticOracle
      )

      await optimisticOracle.deployed()
      console.log("Optimistic Oracle is deployed")

      // Approve collateral for the bond
      const tokenKey = contractConfig.collateralToken as keyof typeof addresses
      const collateralAddress = addresses[tokenKey]
      const collateralAbi = abis[tokenKey]
      console.log("Collateral Address: ", collateralAddress)
      const collateralContract = await ethers.getContractAt(
        collateralAbi,
        collateralAddress || ""
      )
      console.log("Connected to collateral contract")

      const approveTx = await collateralContract.approve(
        addresses.OptimisticOracle,
        ethers.constants.MaxUint256
      )
      await approveTx.wait()
      console.log("Approved collateral")

      // Send Proposal
      const requester = contractConfig.address
      const identifier = ethers.utils.formatBytes32String(
        contractConfig.priceIdentifier
      )
      const timestamp = Math.floor(
        new Date(contractConfig.expirationTime).getTime() / 1000
      ).toString()
      const ancillaryData = ethers.utils.formatBytes32String(
        contractConfig.customAncillaryData
      )

      const proposeTx = await optimisticOracle.proposePrice(
        requester,
        identifier,
        timestamp,
        ancillaryData,
        ethers.utils.parseUnits(proposedPrice)
      )
      await proposeTx.wait()
      console.log("Proposed Price")
    }
  })
