<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title>Price Data</v-card-title>
    <v-card-subtitle
      >Reference API values only - settlement will be based on oracle response
      at expiry
    </v-card-subtitle>

    <v-card-text>
      <v-list-item>
        <v-list-item-title>Current Price</v-list-item-title>
        <v-list-item-subtitle>{{ currentPrice }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Long Token value</v-list-item-title>
        <v-list-item-subtitle
          >{{ collateralPerLongToken }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Short Token Value</v-list-item-title>
        <v-list-item-subtitle
          >{{ collateralPerShortToken }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

const prices = namespace("prices")

@Component
export default class priceDashboard extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  @prices.Action
  updatePriceValue!: (priceFeed: string) => Promise<void>

  @prices.State
  prices!: Record<string, number>

  get currentPrice(): number {
    return this.prices[this.contractDetails.priceIdentifier]
  }

  get percentageLong(): number {
    const upperBound = parseFloat(
      this.contractDetails.financialProductLibraryParameters[0]
    )
    const lowerBound = parseFloat(
      this.contractDetails.financialProductLibraryParameters[1]
    )
    return (this.currentPrice - lowerBound) / (upperBound - lowerBound)
  }

  get collateralPerLongToken(): string {
    const collateralPerPair = parseFloat(this.contractDetails.collateralPerPair)
    const fullPrecision = this.percentageLong * collateralPerPair
    const roundedValue =
      Math.round((fullPrecision + Number.EPSILON) * 10000) / 10000
    return `${roundedValue} ${this.contractDetails.collateralToken}`
  }

  get collateralPerShortToken(): string {
    const collateralPerPair = parseFloat(this.contractDetails.collateralPerPair)
    const fullPrecision = (1 - this.percentageLong) * collateralPerPair
    const roundedValue =
      Math.round((fullPrecision + Number.EPSILON) * 10000) / 10000
    return `${roundedValue} ${this.contractDetails.collateralToken}`
  }

  async created(): Promise<void> {
    await this.updatePriceValue(this.contractDetails.priceIdentifier)
  }
}
</script>
