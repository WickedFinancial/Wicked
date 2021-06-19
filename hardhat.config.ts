import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import "hardhat-deploy"
import { readdir, readFile, writeFile } from "fs/promises"
import { HardhatUserConfig } from "hardhat/types"
import { task } from "hardhat/config"

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
  },
}
export default config
