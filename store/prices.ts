import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import axios from "axios"

const getCurrentTime = () => Math.floor(new Date().getTime() / 1000)
@Module({
  stateFactory: true,
  name: "prices",
  namespaced: true,
})
export default class prices extends VuexModule {
  APIIdentifiers: Record<string, string> = {
    EURUSD: "EURUSD",
  }

  APIURL = "https://marketdata.tradermade.com/api/v1/live"
  APIKEY = "SQyUjib6uIwcq-zOSZ-W"
  blockTimestampFetched = 0
  rateLimitSeconds = 180 //  3 minutes

  prices: Record<string, number> = {}

  @Mutation
  setPriceValue({ priceFeed, value }: { priceFeed: string; value: number }) {
    const newValues: Record<string, number> = {}
    newValues[priceFeed] = value
    this.prices = Object.assign({}, this.prices, newValues)
  }

  @Mutation
  setBlockTimestampFetched(timestamp: number) {
    this.blockTimestampFetched = timestamp
  }

  @Action
  async updatePriceValue(priceFeed: string) {
    const apiIdentifiers = this.APIIdentifiers
    const apiIdentifier = apiIdentifiers[priceFeed]
    const blockTime = this.context.rootState.web3?.blockTimestamp as number
    const timestampToCompare = blockTime !== 0 ? blockTime : getCurrentTime()

    if (
      this.blockTimestampFetched === 0 ||
      timestampToCompare > this.blockTimestampFetched + this.rateLimitSeconds
    ) {
      console.log("Updating price feed: ", priceFeed)
      try {
        const apiResponse = await axios.get(this.APIURL, {
          params: { currency: apiIdentifier, api_key: this.APIKEY },
        })
        console.log(
          `Tradermade api responded for ${priceFeed} with`,
          apiResponse
        )

        const value = apiResponse.data.quotes[0].mid
        this.context.commit("setPriceValue", { priceFeed, value })
        this.context.commit("setBlockTimestampFetched", timestampToCompare)
      } catch (e) {
        console.error("Tradermade price update failed with", e)
        this.context.commit("setBlockTimestampFetched", 0)
      }
    } else {
      console.log("Rate limit applied.")
      console.log(
        "Time left: %s",
        this.blockTimestampFetched + this.rateLimitSeconds - timestampToCompare
      )
    }
  }
}
