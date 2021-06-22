<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-card-title>Tokens</v-card-title>
    <v-card-subtitle>{{ this.collateralAddress }}</v-card-subtitle>
    <v-card-text>
      <v-list-item>
        <v-list-item-title> Collateral Balance </v-list-item-title>
        <v-list-item-subtitle>{{ this.collateralTokens }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Long Balance </v-list-item-title>
        <v-list-item-subtitle>{{ this.longTokens }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-title> Short Balance </v-list-item-title>
        <v-list-item-subtitle>{{ this.shortTokens }}</v-list-item-subtitle>
      </v-list-item>
    </v-card-text>

    <v-card-actions>
      <MintTokens :contractDetails="contractDetails" />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator"
import MintTokens from "@/components/MintTokens.vue"
import { LSPConfiguration } from "~/types"

const addresses: Record<string, string> = require("@/addresses.json")

@Component({ components: { MintTokens } })
export default class contractTokens extends Vue {
  @Prop()
  contractDetails!: LSPConfiguration

  get collateralAddress(): string | undefined {
    return addresses[this.contractDetails.collateralToken]
  }

  get collateralTokens(): number {
    return 100
  }

  get shortTokens(): number {
    return 10
  }

  get longTokens(): number {
    return 20
  }
}
</script>
