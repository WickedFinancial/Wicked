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

type SyntheticTokenContractMapping = {
  shortContract: ethers.Contract
  longContract: ethers.Contract
}

type SyntheticTokenBalances = {
  shortBalance: number
  longBalance: number
}

