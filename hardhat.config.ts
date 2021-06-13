import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/types"

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  namedAccounts: {
    deployer: 0,
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
