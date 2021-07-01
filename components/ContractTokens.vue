<template>
  <v-card v-if="tokenBalancesLoaded" class="mx-auto my-12" max-width="500">
    <v-card-title>Tokens</v-card-title>
    <v-card-text>
      <v-list-item>
        <v-list-item-title> Collateral Balance</v-list-item-title>
        <v-list-item-subtitle>{{ collateralTokens }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title
          ><a :href="etherscanLinkLongToken"> Long Balance</a>
        </v-list-item-title>
        <v-list-item-subtitle
          >{{ syntheticTokens.longBalance }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title
          ><a :href="etherscanLinkShortToken"> Short Balance</a>
        </v-list-item-title>
        <v-list-item-subtitle
          >{{ syntheticTokens.shortBalance }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-card-text>

    <v-card-actions class="justify-between">
      <MintTokens
        v-if="contractState === 0"
        :contract-details="contractDetails"
        :collateral-tokens="collateralTokens"
      />
      <RedeemTokens
        v-if="contractState === 0"
        :contract-details="contractDetails"
        :collateral-tokens="collateralTokens"
      />
      <!-- TODO: Later (when done with testing) we will want to show this only if the current date is past the expiry date  -->
      <ExpireContract
        v-if="contractState === 0"
        :contract-details="contractDetails"
      />
      <SettleTokens
        v-if="contractState === 1 || contractState === 2"
        :contract-details="contractDetails"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from "nuxt-property-decorator"
import {
  LSPConfiguration,
  SyntheticTokenAddresses,
  SyntheticTokenBalances,
} from "~/types"

const addresses: Record<string, string> = require("@/addresses.json")
const contracts = namespace("contracts")

@Component
export default class contractTokens extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  contractState!: number | undefined

  @contracts.State
  collateralTokenBalances!: Record<string, number>

  @contracts.State
  syntheticTokenAddresses!: Record<string, SyntheticTokenAddresses>

  @contracts.State
  syntheticTokenBalances!: Record<string, SyntheticTokenBalances>

  @contracts.State
  tokenBalancesLoaded!: boolean

  get etherscanLinkShortToken(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      this.syntheticTokenAddresses[this.contractDetails.syntheticName]
        .shortAddress
    }`
  }

  get etherscanLinkLongToken(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      this.syntheticTokenAddresses[this.contractDetails.syntheticName]
        .longAddress
    }`
  }

  get etherscanLinkCollateral(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      addresses[this.contractDetails.collateralToken]
    }`
  }

  get collateralTokens(): number {
    const collateralBalances = this.collateralTokenBalances
    if (this.contractDetails.collateralToken in collateralBalances)
      return collateralBalances[this.contractDetails.collateralToken]
    else return -1
  }

  get syntheticTokens(): SyntheticTokenBalances {
    const syntheticBalances = this.syntheticTokenBalances
    return syntheticBalances[this.contractDetails.syntheticName]
  }

  get shortTokens(): number {
    return 10
  }

  get longTokens(): number {
    return 20
  }
}
</script>
