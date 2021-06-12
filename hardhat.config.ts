import "@nomiclabs/hardhat-ethers"
import "hardhat-jest-plugin"
import { HardhatUserConfig } from "hardhat/config"

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      forking: {
        url: "YOURNODE",
      },
    },
  },
}
export default config
