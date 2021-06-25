import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import "hardhat-deploy"
import fs from "fs"
import { readdir, readFile, writeFile } from "fs/promises"
import { HardhatUserConfig } from "hardhat/types"
import { task, types } from "hardhat/config"
import { Address } from "hardhat-deploy/dist/types"
import { Contract } from "ethers"
import { LSPConfiguration } from "./types"
const contractConfigs: Array<LSPConfiguration> = require("./contractConfigs.json")
const deployedContractConfigs: Array<LSPConfiguration> = require("./deployedContractConfigs.json")
const addresses: Record<string, Address> = require("./addresses.json")
const abis = require("./abis")

function mnemonic() {
  try {
    return fs.readFileSync("~/mnemonic.txt").toString().trim()
  } catch (e) {
    console.log("WARNING: No mnemonic file")
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
        url: "https://kovan.infura.io/v3/3ce35c3d389a4461bffd073fbf27d23e",
      },
    },
    kovan: {
      url: "https://kovan.infura.io/v3/3ce35c3d389a4461bffd073fbf27d23e",
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
    const path = "~/abis/"
    const files = await readdir(path)
    for (const file of files) {
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
    "1"
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
      { ethers, getNamedAccounts }
    ) => {
      const collateralContract = await ethers.getContractAt(
        abis[collateralName],
        addresses[collateralName]
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
  )

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
        const collateralAddress = addresses[contractConfig.collateralToken]
        const collateralAbi = abis[contractConfig.collateralToken]
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
        console.log(`Approve tx for ${necessaryCollateral.toString()} of collateral`, approveTx)

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
  .setAction(async ({ gasprice }, { ethers, getNamedAccounts }) => {
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

    for (const contractConfiguration of contractConfigs) {
      try {
        console.log(contractConfiguration)

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
        const collateralTokenAddress =
          addresses[contractConfiguration.collateralToken]
        const financialProductLibraryAddress =
          addresses[contractConfiguration.financialProductLibrary]
        const customAncillaryData = ethers.utils.formatBytes32String(
          contractConfiguration.customAncillaryData
        )
        const prepaidProposerReward = ethers.utils.parseUnits(
          contractConfiguration.prepaidProposerReward
        )

        // Get Collateral Contract instance if not present already
        if (!(contractConfiguration.collateralToken in contracts)) {
          contracts[contractConfiguration.collateralToken] =
            await ethers.getContractAt(
              abis[contractConfiguration.collateralToken],
              collateralTokenAddress
            )
        }

        // Create and Approve collateral for the proposer reward
        const collateralContract =
          contracts[contractConfiguration.collateralToken]
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
        contractConfiguration.address = lspAddress

        console.log(
          `Deployed contract ${syntheticName} to address ${contractConfiguration.address} in transaction: ${launchTx.hash}`
        )

        // Configure Financial ProductLibrary
        // Get Financial Product Library instance if not present already
        if (!(contractConfiguration.financialProductLibrary in contracts)) {
          contracts[contractConfiguration.financialProductLibrary] =
            await ethers.getContractAt(
              abis[contractConfiguration.financialProductLibrary],
              financialProductLibraryAddress
            )
        }

        // Set Parameters
        const financialProductLibraryContract =
          contracts[contractConfiguration.financialProductLibrary]

        await financialProductLibraryContract.setLongShortPairParameters(
          lspAddress,
          ...contractConfiguration.financialProductLibraryParameters,
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


