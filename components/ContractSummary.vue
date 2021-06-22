<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title
      ><a :href="etherscanLinkContract">{{
        this.contractName
      }}</a></v-card-title
    >
    <v-card-subtitle>{{ this.contractType }}</v-card-subtitle>
    <v-card-text>
      <v-list-item>
        <v-list-item-title> Expiration Time </v-list-item-title>
        <v-list-item-subtitle>{{ this.expirationTime }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Collateral </v-list-item-title>
        <v-list-item-subtitle
          ><a :href="etherscanLinkCollateral">{{
            this.contractDetails.collateralToken
          }}</a></v-list-item-subtitle
        >
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Collateral Per Pair</v-list-item-title>
        <v-list-item-subtitle>{{
          this.contractDetails.collateralPerPair
        }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Price Feed </v-list-item-title>
        <v-list-item-subtitle
          ><a :href="priceFeedLink">{{
            this.contractDetails.priceIdentifier
          }}</a></v-list-item-subtitle
        >
      </v-list-item>

      <v-list-item
        v-for="(parameterInfo, index) in libraryConfiguration"
        :key="index"
      >
        <v-list-item-title>{{ parameterInfo.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ parameterInfo.value }}</v-list-item-subtitle>
      </v-list-item>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"

const addresses: Record<string, string> = require("~/addresses.json")

const readableLibraryNames: Record<string, string> = {
  LinearLongShortPairFinancialProductLibrary: "Linear Payout Contract",
}

const libraryParameters: Record<string, Array<string>> = {
  LinearLongShortPairFinancialProductLibrary: ["Upper Bound", "Lower Bound"],
}

const priceFeedLinks: Record<string, string> = {
  USDETH: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md",
}

@Component
export default class contractSummary extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  contractName!: string

  get expirationTime(): string | undefined {
    return new Date(this.contractDetails.expirationTime).toLocaleString()
  }

  get libraryConfiguration(): Array<object> | undefined {
    return this.contractDetails.financialProductLibraryParameters.map(
      (value: string, index: number) => {
        if (this.contractDetails) {
          return {
            name: libraryParameters[
              this.contractDetails.financialProductLibrary
            ][index],
            value,
          }
        } else {
          return {}
        }
      }
    )
  }

  get etherscanLinkContract(): string | undefined {
    return `https://kovan.etherscan.io/address/${this.contractDetails.address}`
  }

  get etherscanLinkCollateral(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      addresses[this.contractDetails.collateralToken]
    }`
  }

  get priceFeedLink(): string | undefined {
    return priceFeedLinks[this.contractDetails.priceIdentifier]
  }

  get contractType(): string | undefined {
    return readableLibraryNames[this.contractDetails.financialProductLibrary]
  }
}
</script>
