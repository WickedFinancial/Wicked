<template>
  <v-container>
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
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"
import { LSPConfiguration } from "@/types"
const addresses: Record<string, string> = require("@/addresses.json")
const contracts = namespace("contracts")

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
export default class contract extends Vue {
  @contracts.State
  contractConfigs!: Array<LSPConfiguration>
  @contracts.Getter
  syntheticNames!: Array<string>

  get contractName(): string {
    return this.$route.params.contract
  }

  get expirationTime(): string | undefined {
    if (this.contractDetails) {
      return new Date(this.contractDetails.expirationTime).toLocaleString()
    }
  }

  get libraryConfiguration(): Array<object> | undefined {
    if (this.contractDetails) {
      return this.contractDetails.financialProductLibraryParameters.map(
        (value, index) => {
          return {
            name: libraryParameters[
              this.contractDetails.financialProductLibrary
            ][index],
            value,
          }
        }
      )
    }
  }

  get etherscanLinkContract(): string | undefined {
    if (this.contractDetails) {
      return `https://kovan.etherscan.io/address/${this.contractDetails.address}`
    }
  }

  get etherscanLinkCollateral(): string | undefined {
    if (this.contractDetails) {
      return `https://kovan.etherscan.io/address/${
        addresses[this.contractDetails.collateralToken]
      }`
    }
  }

  get priceFeedLink(): string | undefined {
    if (this.contractDetails) {
      return priceFeedLinks[this.contractDetails.priceIdentifier]
    }
  }

  get contractDetails(): LSPConfiguration | undefined {
    return this.contractConfigs.find(
      (config) => config.syntheticName === this.contractName
    )
  }

  get contractType(): string | undefined {
    if (this.contractDetails)
      return readableLibraryNames[this.contractDetails.financialProductLibrary]
  }
}
</script>
