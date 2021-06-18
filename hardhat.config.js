require("@nomiclabs/hardhat-ethers")
require("hardhat-jest-plugin")
require("hardhat-deploy")
require("hardhat/types")
const { readdir, readFile, writeFile } = require("fs/promises")
const fs = require("fs")

task("convert", "Convert all json abis to human readable format", async () => {
  const path = "./abis/"
  const files = await readdir(path)
  for (const file of files) {
    const jsonString = await readFile(path.concat(file))
    const jsonAbi = JSON.parse(jsonString)
    const iface = new ethers.utils.Interface(jsonAbi)
    const FormatTypes = ethers.utils.FormatTypes;
    const readableAbi = iface.format(FormatTypes.full)
    console.log("Readable Abi: ", readableAbi)
    await writeFile(path.concat(file), JSON.stringify(readableAbi, null, 2))
  }
})

module.exports = {
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
