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
}
