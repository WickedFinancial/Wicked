import { ethers } from "ethers"
export type LSPConfiguration = {
  expirationTime: string
  collateralPerPair: string
  priceIdentifier: string
  syntheticName: string
  syntheticSymbol: string
  collateralToken: string
  financialProductLibrary: string
  financialProductLibraryParameters: Array<string>
  customAncillaryData: string
  prepaidProposerReward: string
  collateralPriceInEth: number
  address?: string
  success?: boolean
  error?: string
}

export type SyntheticTokenContractMapping = {
  shortContract: ethers.Contract
  longContract: ethers.Contract
}

export type SyntheticTokenBalances = {
  shortBalance: number
  longBalance: number
}

export type SyntheticTokenAddresses = {
  shortAddress: string
  longAddress: string
}
