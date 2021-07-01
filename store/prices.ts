import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import axios from "axios"

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
  APIKEY = "xGBXbKl-Rz7fdjjiDtTG"

  prices: Record<string, number> = {}

  get getPrices() {
    return this.prices
  }

  get getAPIIdentifiers() {
    return this.APIIdentifiers
  }

  @Mutation
  setPriceValue({ priceFeed, value }: { priceFeed: string; value: number }) {
    let newValues: Record<string, number> = {}
    newValues[priceFeed] = value
    this.prices = Object.assign({}, this.prices, newValues)
  }

  @Action
  async updatePriceValue(priceFeed: string) {
    console.log("Updating price feed: ", priceFeed)
    const apiIdentifiers = this.context.getters["getAPIIdentifiers"]
    const apiIdentifier = apiIdentifiers[priceFeed]
    if (apiIdentifier === undefined) {
      console.log(`No API Indentifier configured for: `, priceFeed)
    }
    const apiResponse = await axios.get(this.APIURL, {
      params: { currency: apiIdentifier, api_key: this.APIKEY },
    })
    console.log(`Tradermade api responded for ${priceFeed} with`, apiResponse)

    const value = apiResponse.data.quotes[0].mid
    this.context.commit("setPriceValue", { priceFeed, value })
  }
}
