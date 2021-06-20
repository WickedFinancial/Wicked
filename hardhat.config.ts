import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import "hardhat-deploy"
import fs from "fs"
import { readdir, readFile, writeFile } from "fs/promises"
import { HardhatUserConfig } from "hardhat/types"
import { task } from "hardhat/config"
import { Address } from "hardhat-deploy/dist/types"
import { Contract } from "ethers"
import { LSPConfiguration } from "types"

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim()
  } catch (e) {
    console.log(
      "WARNING: No mnemonic file"
    )
  }
  return ""
}

task(
  "convert",
  "Convert all json abis to human readable format",
  async (_, { ethers }) => {
    const path = "./abis/"
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

task(
  "launch",
  "Launch all configured LSP contracts",
  async (_, { ethers, getNamedAccounts }) => {
    const contractConfigs: Array<LSPConfiguration> = require("./contractConfigs.json")
    const addresses: Record<string, Address> = require("./addresses.json")
    const abis = require("./abis")

    const LSPCreator = await ethers.getContractAt(
      abis.LSPCreator,
      addresses.LSPCreator
    )
    const namedAccounts = await getNamedAccounts()
    const gasprice = 50
    const transactionOptions = {
      gasPrice: gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: namedAccounts.deployer,
    }

    let contracts: Record<string, Contract> = { LSPCreator }

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
        const financialProductLibrary =
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
          financialProductLibrary,
          customAncillaryData,
          prepaidProposerReward,
          transactionOptions
        )

        console.log(`Deploying  ${syntheticName} to address ${lspAddress}`)

        const launchTX = await LSPCreator.createLongShortPair(
          expirationTimestamp,
          collateralPerPair,
          priceIdentifier,
          syntheticName,
          syntheticSymbol,
          collateralTokenAddress,
          financialProductLibrary,
          customAncillaryData,
          prepaidProposerReward,
          transactionOptions
        )
        contractConfiguration.address = lspAddress

        console.log(
          `Deployed contract ${syntheticName} to address ${contractConfiguration.address}`
        )
      } catch (e) {
        contractConfiguration.address = "FAILED"
        console.log(
          `FAILED to deploy contract ${contractConfiguration.syntheticName}`,
          e
        )
      }
    }
    const outputFile = "./deployedContractConfigs.json"
    await writeFile(outputFile, JSON.stringify(contractConfigs, null, 2))
  }
)

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