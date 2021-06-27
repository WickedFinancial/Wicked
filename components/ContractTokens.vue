<template>
  <v-card v-if="tokenBalancesLoaded" class="mx-auto my-12" max-width="500">
    <v-card-title>Tokens</v-card-title>
    <v-card-text>
      <v-list-item>
        <v-list-item-title> Collateral Balance </v-list-item-title>
        <v-list-item-subtitle>{{ this.collateralTokens }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title
          ><a :href="etherscanLinkLongToken"> Long Balance</a>
        </v-list-item-title>
        <v-list-item-subtitle>{{
          this.syntheticTokens.longBalance
        }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title
          ><a :href="etherscanLinkShortToken"> Short Balance</a>
        </v-list-item-title>
        <v-list-item-subtitle>{{
          this.syntheticTokens.shortBalance
        }}</v-list-item-subtitle>
      </v-list-item>
    </v-card-text>

    <v-card-actions class="justify-between">
      <MintTokens
        :contractDetails="contractDetails"
        :collateralTokens="collateralTokens"
        v-if="contractState === 0"
      />
      <RedeemTokens
        :contractDetails="contractDetails"
        :collateralTokens="collateralTokens"
        v-if="contractState === 0"
      />
      <ExpireContract
        v-if="contractState === 0"
        :contractDetails="contractDetails"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, namespace, Prop } from "nuxt-property-decorator"
import MintTokens from "@/components/MintTokens.vue"
import RedeemTokens from "@/components/RedeemTokens.vue"
import ExpireContract from "@/components/ExpireContract.vue"
import {
  LSPConfiguration,
  SyntheticTokenContractMapping,
  SyntheticTokenBalances,
  SyntheticTokenAddresses,
} from "~/types"

const addresses: Record<string, string> = require("@/addresses.json")
const contracts = namespace("contracts")

@Component({ components: { MintTokens, RedeemTokens, ExpireContract } })
export default class contractTokens extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  @Prop()
  contractState!: number | undefined

  @contracts.Getter
  getCollateralTokenBalances!: Record<string, number>

  @contracts.Getter
  getSyntheticTokenAddresses!: Record<string, SyntheticTokenAddresses>

  @contracts.Getter
  getSyntheticTokenBalances!: Record<string, SyntheticTokenBalances>

  @contracts.State
  tokenBalancesLoaded!: boolean

  get etherscanLinkShortToken(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      this.getSyntheticTokenAddresses[this.contractDetails.syntheticName]
        .shortAddress
    }`
  }

  get etherscanLinkLongToken(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      this.getSyntheticTokenAddresses[this.contractDetails.syntheticName]
        .longAddress
    }`
  }

  get etherscanLinkCollateral(): string | undefined {
    return `https://kovan.etherscan.io/address/${
      addresses[this.contractDetails.collateralToken]
    }`
  }

  get collateralTokens(): number {
    const collateralBalances = this.getCollateralTokenBalances
    if (this.contractDetails.collateralToken in collateralBalances)
      return collateralBalances[this.contractDetails.collateralToken]
    else return -1
  }

  get syntheticTokens(): SyntheticTokenBalances {
    const syntheticBalances = this.getSyntheticTokenBalances
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
