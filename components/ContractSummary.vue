<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title
      ><a :href="etherscanLinkContract">{{ contractName }}</a></v-card-title
    >
    <v-card-subtitle>{{ contractType }}</v-card-subtitle>
    <v-card-text>
      <v-list-item>
        <v-list-item-title> Expiration Time</v-list-item-title>
        <v-list-item-subtitle>{{ expirationTime }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Collateral</v-list-item-title>
        <v-list-item-subtitle>
          <a :href="etherscanLinkCollateral">{{ collateralToken }}</a>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Collateral Per Pair</v-list-item-title>
        <v-list-item-subtitle>{{ collateralPerPair }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Price Feed</v-list-item-title>
        <v-list-item-subtitle>
          <a :href="priceFeedLink">{{ priceIdentifier }}</a>
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>Contract State</v-list-item-title>
        <v-list-item-subtitle>{{ contractStateLabel }}</v-list-item-subtitle>
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
import { Component, Prop, Vue } from "nuxt-property-decorator"
import { LSPConfiguration } from "~/types"
import addresses from "~/addresses.json"

const readableLibraryNames = {
  LinearLongShortPairFinancialProductLibrary: "Linear Payout Contract",
}

const libraryParameters = {
  LinearLongShortPairFinancialProductLibrary: ["Upper Bound", "Lower Bound"],
}

const priceFeedLinks = {
  EURUSD: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-29.md",
}

type parameterInfo = {
  name: string
  value: string
}

@Component
export default class contractSummary extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  contractName!: string

  @Prop()
  contractState!: number | undefined

  stateLabelMapping: Record<number, string> = {
    0: "Open",
    1: "Expired - Price Requested",
    2: "Expired - Price Received",
  }

  get contractStateLabel(): string {
    return this.contractState !== undefined
      ? this.stateLabelMapping[this.contractState]
      : "Not Connected"
  }

  get expirationTime(): string {
    return new Date(this.contractDetails.expirationTime).toLocaleString()
  }

  get libraryConfiguration(): Array<parameterInfo> | object {
    const params = this.contractDetails.financialProductLibraryParameters
    const financialProductLibrary =
      libraryParameters[
        this.contractDetails
          .financialProductLibrary as keyof typeof libraryParameters
      ]

    return params.map((value: string, index: number) => {
      return {
        name: financialProductLibrary[index],
        value,
      }
    })
  }

  get etherscanLinkContract(): string | undefined {
    const address = this.contractDetails.address
    return `https://kovan.etherscan.io/address/${address}`
  }

  get etherscanLinkCollateral(): string | undefined {
    const address =
      addresses[this.contractDetails.collateralToken as keyof typeof addresses]
    return `https://kovan.etherscan.io/address/${address}`
  }

  get priceFeedLink(): string {
    return priceFeedLinks[
      this.contractDetails.priceIdentifier as keyof typeof priceFeedLinks
    ]
  }

  get contractType(): string {
    return readableLibraryNames[
      this.contractDetails
        .financialProductLibrary as keyof typeof readableLibraryNames
    ]
  }

  get collateralToken(): string {
    return this.contractDetails.collateralToken
  }

  get collateralPerPair(): string {
    return this.contractDetails.collateralPerPair
  }

  get priceIdentifier(): string {
    return this.contractDetails.priceIdentifier
  }
}
</script>
