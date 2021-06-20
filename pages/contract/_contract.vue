<template>
  <v-container>
    <v-card :loading="loading" class="mx-auto my-12" max-width="500">
      <v-card-title
        ><a :href="etherscanLink">{{ this.contractName }}</a></v-card-title
      >
      <v-card-subtitle>{{ this.contractType }}</v-card-subtitle>
      <v-card-text>
        <v-list-item>
          <v-list-item-title> Expiration Time </v-list-item-title>
          <v-list-item-subtitle>{{ this.expirationTime }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title> Collateral </v-list-item-title>
          <v-list-item-subtitle>{{
            this.contractDetails.collateralToken
          }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title> Collateral Per Pair</v-list-item-title>
          <v-list-item-subtitle>{{
            this.contractDetails.collateralPerPair
          }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title> Price Feed </v-list-item-title>
          <v-list-item-subtitle>{{
            this.contractDetails.priceIdentifier
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, namespace } from "nuxt-property-decorator"
import { LSPConfiguration } from "@/types"
const contracts = namespace("contracts")

const readableLibraryNames: Record<string, string> = {
  LinearLongShortPairFinancialProductLibrary: "Linear Payout Contract",
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

  get etherscanLink(): string | undefined {
    if (this.contractDetails) {
      return `https://kovan.etherscan.io/address/${this.contractDetails.address}`
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
